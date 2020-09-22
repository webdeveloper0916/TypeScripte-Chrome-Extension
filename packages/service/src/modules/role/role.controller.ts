import _ from 'lodash'
import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards } from '@nestjs/common'
import { CollectionV2, SystemUserRoles } from '@/constants'
import { RecordExistException } from '@/common'
import { CloudBaseService } from '@/dynamic_modules'
import { PermissionGuard } from '@/guards'
import { IsNotEmpty } from 'class-validator'

class UserRole {
    // 角色名
    @IsNotEmpty()
    roleName: string

    // 角色描述
    @IsNotEmpty()
    description: string

    // 角色绑定的权限描述
    @IsNotEmpty()
    permissions: Permission[]
}

class Permission {
    // 项目
    @IsNotEmpty()
    projectId: '*' | string

    // 行为
    @IsNotEmpty()
    action: string[] | ['*']

    // TODO: 允许访问/拒绝访问
    effect: 'allow' | 'deny'

    // 服务
    @IsNotEmpty()
    service: string | '*'

    // 具体资源
    @IsNotEmpty()
    resource: string[] | ['*']
}

@UseGuards(PermissionGuard('role', ['administrator']))
@Controller('role')
export class RoleController {
    constructor(private readonly cloudbaseService: CloudBaseService) {}

    @Get()
    async getUserRoles(@Query() query: { page?: number; pageSize?: number } = {}) {
        const { page = 1, pageSize = 20 } = query

        const { data, requestId } = await this.cloudbaseService
            .collection(CollectionV2.CustomUserRoles)
            .where({})
            .skip(Number(page - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .get()

        return {
            data: [...data, ...SystemUserRoles],
            requestId,
        }
    }

    @Post()
    async createUserRole(@Body() body: UserRole) {
        // 检查集合是否存在
        const { data } = await this.cloudbaseService
            .collection(CollectionV2.CustomUserRoles)
            .where({
                roleName: body.roleName,
            })
            .get()

        if (data?.length) {
            throw new RecordExistException()
        }

        const role = _.omit(body, ['_id'])

        role.permissions.forEach((role) => {
            if (!role.effect) {
                role.effect = 'allow'
            }
        })

        return this.cloudbaseService.collection(CollectionV2.CustomUserRoles).add(role)
    }

    @Delete(':id')
    async deleteUserRole(@Param() id: string) {
        return this.cloudbaseService.collection(CollectionV2.CustomUserRoles).doc(id).remove()
    }
}
