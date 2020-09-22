import { dateToNumber, nanoid } from '@/utils'
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common'

@Injectable()
export class SchemaTransfromPipe implements PipeTransform {
    constructor(private readonly action: 'create' | 'update') {}

    transform(value: any, metadata: ArgumentMetadata) {
        const _createTime = dateToNumber()
        const _updateTime = _createTime

        if (this.action === 'create') {
            value.fields = value.fields.map((v) => {
                const id = v.id || nanoid()
                return {
                    ...v,
                    id
                }
            })

            return {
                ...value,
                _createTime,
                _updateTime
            }
        }

        if (this.action === 'update') {
            // 为 field 添加 id
            value.fields = value.fields.map((v) => {
                const id = v.id || nanoid()
                return {
                    ...v,
                    id
                }
            })

            return {
                ...value,
                _updateTime
            }
        }

        return value
    }
}
