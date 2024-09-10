import dotenv from 'dotenv'
import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

dotenv.config()

@Injectable()
export class DbService {
	constructor(private prisma: PrismaService) {}

	async drop() {
		/*try {
			await this.prisma.$queryRaw`DO
$$
DECLARE
    r RECORD;
BEGIN
    -- Disable foreign key checks
    EXECUTE 'SET session_replication_role = replica';

    -- Loop through all tables and truncate
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
    END LOOP;

    -- Re-enable foreign key checks
    EXECUTE 'SET session_replication_role = DEFAULT';
END
$$;`

			return true
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.log(err.message)
			}

			return false
		}*/
		return true
	}
}
