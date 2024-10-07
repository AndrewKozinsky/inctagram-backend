import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { plainToInstance, Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class GetCountryCitiesQueries {
	@IsOptional()
	@IsString({ message: 'SearchNameTerm must be a string' })
	// Search term for blog Name: Name should contain this term in any position
	searchNameTerm?: string

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	// pageNumber is number of portions that should be returned. Default value : 1
	pageNumber?: number

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	// pageSize is portions size that should be returned. Default value : 10
	pageSize?: number
}

@Injectable()
export class GetCountryCitiesQueriesPipe implements PipeTransform {
	async transform(dto: GetCountryCitiesQueries, { metatype }: ArgumentMetadata) {
		if (!metatype) {
			return dto
		}

		return plainToInstance(metatype, dto)
	}
}
