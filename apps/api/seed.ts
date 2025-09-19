import { DataSource } from 'typeorm';
import { Organization } from '../api/src/entities/organization.entity'
const dataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [Organization],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  const orgRepo = dataSource.getRepository(Organization);

  await orgRepo.save([
    { id: 1, name: 'TurboVets' },
    { id: 2, name: 'Sales' },
    { id: 3, name: 'Digital Marketing', parentId: 1 },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'ABC', parentId: 1 },
  ]);

  console.log('Organizations seeded!');
  process.exit();
}

seed();
