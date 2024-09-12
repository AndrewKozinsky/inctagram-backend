import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { add } from 'date-fns'
import { ServerHelperService } from '@app/server-helper'
import { HashAdapterService } from '@app/hash-adapter'
import { PrismaService } from '../db/prisma.service'
import { CreateUserDtoModel } from '../models/user/user.input.model'
import { UserServiceModel } from '../models/user/user.service.model'
import { createUniqString } from '../utils/stringUtils'
import { JwtAdapterService } from '@app/jwt-adapter'

@Injectable()
export class CountryRepository {
	constructor(private prisma: PrismaService) {}

	async createCountry(countryName: string) {}
}
