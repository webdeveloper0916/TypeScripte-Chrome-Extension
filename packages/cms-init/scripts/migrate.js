/* eslint-disable */
const { customAlphabet } = require('nanoid')

const nanoid = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-',
    32
)

const userCollection = 'tcb-ext-cms-users'
const projectCollection = 'tcb-ext-cms-projects'
const schemaCollection = 'tcb-ext-cms-schemas'
const webhookCollection = 'tcb-ext-cms-webhooks'

// 迁移用户账号
async function migrateUsers(context) {
    const { db, manager } = context

    let result = await manager.database.checkCollectionExists(userCollection)
    if (!result.Exists) return

    // 将 userName 重名为 username
    const $ = db.command
    await db
        .collection(userCollection)
        .where({})
        .update({
            userName: $.rename('username'),
        })

    // 迁移管理员和运营人员
    await db
        .collection(userCollection)
        .where({
            role: 'administrator',
        })
        .update({
            roles: ['administrator'],
        })

    await db
        .collection(userCollection)
        .where({
            role: 'operator',
        })
        .update({
            roles: ['content:administrator'],
        })
}

// 创建项目
async function createProject(context) {
    const { db, manager } = context

    await manager.database.createCollectionIfNotExists(projectCollection)

    const { data } = await db.collection(projectCollection).where({}).get()

    if (!data || !data.length) {
        const { id, _id } = await db.collection(projectCollection).add({
            name: 'V1 项目',
            description: 'CloudBase CMS V1 版本数据',
        })
        return id || _id
    } else {
        return data[0]._id
    }
}

// 迁移原型
async function migrateSchemas(context, projectId) {
    const { db, manager } = context

    await manager.database.createCollectionIfNotExists(schemaCollection)

    const { data: contents } = await db.collection('tcb-ext-cms-contents').where({}).get()

    if (!contents || !contents.length) return

    const promises = contents.map(async (content) => {
        const fields =
            content.fields && content.fields.length
                ? content.fields.map((field, index) => {
                      const {
                          fieldType,
                          fieldLabel,
                          fieldName,
                          helpText,
                          hidden,
                          isRequired,
                          defaultValue,
                          stringMinLength,
                          stringMaxLength,
                          connectField,
                          connectResource,
                      } = field

                      return {
                          id: nanoid(),
                          displayName: fieldLabel,
                          name: fieldName,
                          type: fieldType,
                          isHidden: hidden,
                          description: helpText,
                          isRequired,
                          defaultValue,
                          connectField,
                          connectResource,
                          min: stringMinLength,
                          max: stringMaxLength,
                          order: index,
                      }
                  })
                : []

        const newSchema = {
            fields,
            projectId,
            _id: content._id,
            displayName: content.label,
            collectionName: content.collectionName,
            _createTime: Date.now(),
            _updateTime: Date.now(),
        }

        const { data: targetSchema } = await db.collection(schemaCollection).doc(content._id).get()

        console.log(targetSchema)

        // 跳过已存在的原型
        if (targetSchema && targetSchema.length) return

        await db.collection(schemaCollection).add(newSchema)
    })

    await Promise.all(promises)
}

// 迁移 Webhook
async function migrateWebhooks(context, projectId) {
    const { db, manager } = context

    let result = await manager.database.checkCollectionExists(webhookCollection)

    if (!result.Exists) return

    const { data: webhooks } = await db.collection(webhookCollection).where({}).get()

    if (!webhooks || !webhooks.length) {
        return
    }

    const $ = db.command

    // 添加项目 Id
    await db.collection(webhookCollection).where({}).update({
        projectId,
    })

    await db
        .collection(webhookCollection)
        .where({
            triggerType: 'all',
        })
        .update({
            event: ['*'],
        })

    // 将 updateMany 和 deleteMany 转换成 update 和 delete
    await db
        .collection(webhookCollection)
        .where({
            event: $.and($.elemMatch($.eq('updateMany')), $.not($.elemMatch($.eq('update')))),
        })
        .update({
            event: $.push(['update']),
        })

    await db
        .collection(webhookCollection)
        .where({
            event: $.elemMatch($.eq('updateMany')),
        })
        .update({
            event: $.pullAll(['updateMany']),
        })

    await db
        .collection(webhookCollection)
        .where({
            event: $.and($.elemMatch($.eq('deleteMany')), $.not($.elemMatch($.eq('delete')))),
        })
        .update({
            event: $.push(['delete']),
        })

    await db
        .collection(webhookCollection)
        .where({
            event: $.elemMatch($.eq('deleteMany')),
        })
        .update({
            event: $.pullAll(['deleteMany']),
        })

    const { data: schemas } = await db.collection('tcb-ext-cms-contents').where({}).get()

    const promises = webhooks.map(async (webhook) => {
        const collections = webhook.collections.map((_) =>
            schemas.find((schema) => schema._id === _)
        )

        await db.collection('tcb-ext-cms-contents').doc(webhook._id).update({
            collections,
        })
    })

    await Promise.all(promises)
}

module.exports = {
    async migrate(context) {
        const { db, manager } = context

        // 是否为 V1 项目
        let result = await manager.database.checkCollectionExists('tcb-ext-cms-contents')
        if (!result.Exists) return

        result = await manager.database.checkCollectionExists('tcb-ext-cms-settings')
        if (result.Exists) {
            const { data: settings } = await db
                .collection('tcb-ext-cms-settings')
                .where({
                    migrated: true,
                })
                .get()

            if (settings && settings.length) {
                return
            }
        }

        console.log('开始迁移用户')
        await migrateUsers(context)
        console.log('用户迁移完成')

        console.log('创建项目')
        const projectId = await createProject(context)
        console.log('创建项目完成', projectId)

        console.log('开始迁移内容设置')
        await migrateSchemas(context, projectId)
        console.log('内容设置迁移完成')

        console.log('开始迁移 Webhooks')
        await migrateWebhooks(context, projectId)
        console.log('Webhooks 迁移完成')

        // 设置迁移完成
        console.log('存储迁移信息')
        await manager.database.createCollectionIfNotExists('tcb-ext-cms-settings')

        const { data } = await db.collection('tcb-ext-cms-settings').where({}).get()

        if (data && data.length) {
            await db.collection('tcb-ext-cms-settings').where({}).update({
                migrated: true,
            })
        } else {
            await db.collection('tcb-ext-cms-settings').add({
                migrated: true,
            })
        }
        console.log('迁移完成')
    },
}
