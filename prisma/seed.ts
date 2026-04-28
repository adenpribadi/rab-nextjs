import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data to avoid duplicates
  await prisma.user.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.costItem.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.client.deleteMany({})
  await prisma.supplier.deleteMany({})

  console.log('Seeding users...')
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedAdminPassword,
      name: 'Administrator',
      role: 'ADMIN'
    }
  })

  const hashedUserPassword = await bcrypt.hash('user123', 10)
  await prisma.user.create({
    data: {
      username: 'user',
      password: hashedUserPassword,
      name: 'Estimator Pro',
      role: 'USER'
    }
  })

  console.log('Seeding clients...')
  const client1 = await prisma.client.create({
    data: { name: 'Bpk. Budi Santoso', phone: '081234567890', address: 'Jl. Sudirman No. 45, Jakarta' }
  })
  const client2 = await prisma.client.create({
    data: { name: 'Suhartono', company: 'PT. Logistik Cepat', email: 'contact@logistikcepat.com' }
  })
  const client3 = await prisma.client.create({
    data: { name: 'Pengurus Warga', company: 'Perumahan Pesona Indah', address: 'Blok A - C, Tangerang' }
  })
  const client4 = await prisma.client.create({
    data: { name: 'Andi Karya', company: 'CV. Karya Muda (Kopi Senja)', email: 'hello@kopisenja.com' }
  })

  console.log('Seeding suppliers...')
  const sup1 = await prisma.supplier.create({ data: { name: 'TB. Bangun Perkasa', category: 'Material Sipil', contactName: 'Ko Ahong', phone: '08112223334' } })
  const sup2 = await prisma.supplier.create({ data: { name: 'Sinar Baja Mandiri', category: 'Besi & Baja', phone: '08123334445' } })
  const sup3 = await prisma.supplier.create({ data: { name: 'CV. Elektrik Maju', category: 'Elektrikal', contactName: 'Bpk. Yanto' } })
  const sup4 = await prisma.supplier.create({ data: { name: 'Toko Kaca Bening', category: 'Kaca & Aluminium', phone: '08555666777' } })

  console.log('Seeding categories...')
  const cat1 = await prisma.category.create({ data: { id: 1, name: 'Pekerjaan Persiapan' } })
  const cat2 = await prisma.category.create({ data: { id: 2, name: 'Pekerjaan Tanah & Pasir' } })
  const cat3 = await prisma.category.create({ data: { id: 3, name: 'Pekerjaan Pasangan & Plesteran' } })
  const cat4 = await prisma.category.create({ data: { id: 4, name: 'Pekerjaan Atap' } })
  const cat5 = await prisma.category.create({ data: { id: 5, name: 'Pekerjaan Elektrikal' } })

  console.log('Seeding projects...')

  const p1 = await prisma.project.create({
    data: {
      name: 'Renovasi Rumah Minimalis 2 Lantai',
      clientId: client1.id,
      clientName: client1.name,
      location: 'Jl. Sudirman No. 45, Jakarta',
      description: 'Pekerjaan renovasi total rumah tinggal keluarga di kawasan perumahan. Meliputi pembongkaran atap, penambahan lantai 2, dan perbaikan instalasi listrik.',
      budget: 250000000,
      status: 'PLANNING',
      items: {
        create: [
          { name: 'Semen Portland 50kg', categoryId: 3, quantity: 100, unit: 'Zak', unitPrice: 65000, totalPrice: 6500000 },
          { name: 'Pasir Lumajang', categoryId: 2, quantity: 2, unit: 'Truk', unitPrice: 1500000, totalPrice: 3000000 },
          { name: 'Besi Beton 10mm', categoryId: 1, quantity: 50, unit: 'Batang', unitPrice: 85000, totalPrice: 4250000 }
        ]
      }
    },
  })

  const p2 = await prisma.project.create({
    data: {
      name: 'Pembangunan Gudang Logistik',
      clientId: client2.id,
      clientName: client2.company,
      location: 'Kawasan Industri Cikarang',
      description: 'Proyek pembangunan gudang penyimpanan barang berukuran 20x30 meter dengan struktur baja ringan dan lantai cor beton standar pabrik.',
      budget: 850000000,
      status: 'IN_PROGRESS',
      items: {
        create: [
          { 
            name: 'Baja Ringan C75', categoryId: 4, quantity: 200, unit: 'Batang', unitPrice: 95000, totalPrice: 19000000,
            expenses: { create: [{ amount: 15000000, supplierId: sup2.id, receiptNo: 'INV-SJ-001', notes: 'DP Baja Ringan (80%)' }] }
          },
          { 
            name: 'Atap Spandek Pasir', categoryId: 4, quantity: 600, unit: 'M2', unitPrice: 110000, totalPrice: 66000000,
            expenses: { create: [{ amount: 66000000, supplierId: sup2.id, receiptNo: 'INV-SJ-002', notes: 'Lunas Spandek' }] }
          },
          { 
            name: 'Kabel NYM 3x2.5mm', categoryId: 5, quantity: 3, unit: 'Roll', unitPrice: 1200000, totalPrice: 3600000,
            expenses: { create: [{ amount: 3600000, supplierId: sup3.id, receiptNo: 'NOTA-ELK-12', notes: 'Lunas Kabel Utama' }] }
          }
        ]
      }
    },
  })

  const p3 = await prisma.project.create({
    data: {
      name: 'Perbaikan Drainase dan Pagar Keliling',
      clientId: client3.id,
      clientName: client3.company,
      location: 'Blok A - C, Tangerang',
      description: 'Perbaikan saluran pembuangan air dan pembuatan pagar tembok keliling setinggi 2 meter menggunakan batako pres.',
      budget: 45000000,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2023-12-15'),
      status: 'COMPLETED',
      items: {
        create: [
          { 
            name: 'Batako Pres', categoryId: 3, quantity: 2000, unit: 'Pcs', unitPrice: 3500, totalPrice: 7000000,
            expenses: { create: [{ amount: 7200000, supplierId: sup1.id, receiptNo: 'INV-009', notes: 'Beli Batako Pres Lunas, lebih 200k karena kena ongkir' }] }
          },
          { 
            name: 'Semen Gresik 40kg', categoryId: 3, quantity: 50, unit: 'Zak', unitPrice: 52000, totalPrice: 2600000,
            expenses: { create: [{ amount: 2600000, supplierId: sup1.id, receiptNo: 'INV-009' }] }
          },
          { 
            name: 'Pipa PVC Maspion 4"', categoryId: 1, quantity: 120, unit: 'Batang', unitPrice: 85000, totalPrice: 10200000,
            expenses: { create: [{ amount: 10000000, supplierId: sup1.id, receiptNo: 'INV-010', notes: 'Pipa diskon grosir' }] }
          }
        ]
      }
    },
  })

  const p4 = await prisma.project.create({
    data: {
      name: 'Interior Cafe Kopi Kekinian',
      clientId: client4.id,
      clientName: client4.company,
      location: 'Jl. Braga, Bandung',
      description: 'Pengerjaan desain interior gaya industrial, pembuatan meja bar, partisi kaca, dan instalasi pencahayaan estetik.',
      budget: 120000000,
      startDate: new Date('2024-05-10'),
      endDate: new Date('2024-07-20'),
      status: 'PLANNING',
      items: {
        create: [
          { name: 'Multiplek 18mm Meranti', categoryId: 1, quantity: 40, unit: 'Lembar', unitPrice: 285000, totalPrice: 11400000 },
          { name: 'Kaca Tempered 8mm', categoryId: 3, quantity: 15, unit: 'M2', unitPrice: 650000, totalPrice: 9750000 },
          { name: 'Lampu Track Light LED', categoryId: 5, quantity: 20, unit: 'Set', unitPrice: 350000, totalPrice: 7000000 }
        ]
      }
    },
  })

  console.log('Seeding finished successfully.')
  console.log('Projects created:', [p1.name, p2.name, p3.name, p4.name].join(', '))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
