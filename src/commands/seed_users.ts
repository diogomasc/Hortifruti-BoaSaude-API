import { hash } from "argon2";
import { db } from "../database/client";
import { users, products, wallets, addresses } from "../database/schema";

async function seedUsers() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar dados existentes (opcional - descomente se necessário)
    // await db.delete(products);
    // await db.delete(wallets);
    // await db.delete(addresses);
    // await db.delete(users);

    const passwordHash = await hash("123456");

    // 1. Criar 4 produtores
    console.log("👨‍🌾 Criando produtores...");
    
    const producer1 = await db.insert(users).values({
      email: "prod1@email.com",
      passwordHash,
      role: "producer",
      firstName: "João",
      lastName: "Silva",
      phone: "11987654321",
      cnpj: "12345678000195",
      shopName: "Horta do João",
      shopDescription: "Especialista em verduras orgânicas e legumes frescos. Produção familiar com mais de 20 anos de experiência.",
    }).returning();

    const producer2 = await db.insert(users).values({
      email: "prod2@email.com",
      passwordHash,
      role: "producer",
      firstName: "Maria",
      lastName: "Santos",
      phone: "11987654322",
      cnpj: "23456789000196",
      shopName: "Frutas da Maria",
      shopDescription: "Produtora de frutas tropicais e cítricas. Foco em produtos sazonais e de alta qualidade.",
    }).returning();

    const producer3 = await db.insert(users).values({
      email: "prod3@email.com",
      passwordHash,
      role: "producer",
      firstName: "Carlos",
      lastName: "Oliveira",
      phone: "11987654323",
      cnpj: "34567890000197",
      shopName: "Grãos & Sementes Carlos",
      shopDescription: "Especializado em grãos, sementes, castanhas e produtos integrais. Cultivo sustentável.",
    }).returning();

    const producer4 = await db.insert(users).values({
      email: "prod4@email.com",
      passwordHash,
      role: "producer",
      firstName: "Ana",
      lastName: "Costa",
      phone: "11987654324",
      cnpj: "45678901000198",
      shopName: "Ervas & Temperos Ana",
      shopDescription: "Produção de ervas aromáticas, temperos frescos e flores comestíveis. Cultivo orgânico certificado.",
    }).returning();

    // Criar wallets para os produtores
    console.log("💰 Criando carteiras dos produtores...");
    await db.insert(wallets).values([
      { userId: producer1[0].id, balance: "0" },
      { userId: producer2[0].id, balance: "0" },
      { userId: producer3[0].id, balance: "0" },
      { userId: producer4[0].id, balance: "0" },
    ]);

    // 2. Criar produtos para cada produtor
    console.log("🥬 Criando produtos...");

    // Produtos do João (Verduras e Legumes)
    await db.insert(products).values([
      {
        title: "Alface Crespa Orgânica",
        description: "Alface crespa cultivada sem agrotóxicos, ideal para saladas frescas e nutritivas.",
        price: "4.50",
        category: "verduras",
        producerId: producer1[0].id,
        quantity: 50,
      },
      {
        title: "Tomate Cereja",
        description: "Tomates cereja doces e suculentos, perfeitos para saladas e aperitivos.",
        price: "8.90",
        category: "legumes",
        producerId: producer1[0].id,
        quantity: 30,
      },
      {
        title: "Cenoura Baby",
        description: "Cenouras baby tenras e doces, ideais para cozimento rápido ou consumo in natura.",
        price: "6.20",
        category: "legumes",
        producerId: producer1[0].id,
        quantity: 40,
      },
      {
        title: "Rúcula Selvagem",
        description: "Rúcula com sabor marcante e folhas tenras, perfeita para saladas gourmet.",
        price: "5.80",
        category: "verduras",
        producerId: producer1[0].id,
        quantity: 25,
      },
      {
        title: "Abobrinha Italiana",
        description: "Abobrinhas frescas e tenras, versáteis para diversos pratos culinários.",
        price: "7.30",
        category: "legumes",
        producerId: producer1[0].id,
        quantity: 35,
      },
    ]);

    // Produtos da Maria (Frutas)
    await db.insert(products).values([
      {
        title: "Manga Palmer",
        description: "Mangas Palmer maduras e doces, com polpa suculenta e aroma irresistível.",
        price: "12.90",
        category: "frutas",
        producerId: producer2[0].id,
        quantity: 20,
      },
      {
        title: "Laranja Pera",
        description: "Laranjas Pera suculentas, ricas em vitamina C, ideais para sucos naturais.",
        price: "8.50",
        category: "frutas",
        producerId: producer2[0].id,
        quantity: 60,
      },
      {
        title: "Banana Prata",
        description: "Bananas prata doces e nutritivas, fonte natural de potássio e energia.",
        price: "6.80",
        category: "frutas",
        producerId: producer2[0].id,
        quantity: 80,
      },
      {
        title: "Maracujá Doce",
        description: "Maracujás doces com polpa aromática, perfeitos para sucos e sobremesas.",
        price: "15.20",
        category: "frutas",
        producerId: producer2[0].id,
        quantity: 15,
      },
      {
        title: "Limão Tahiti",
        description: "Limões Tahiti frescos e suculentos, ideais para temperos e bebidas.",
        price: "9.90",
        category: "frutas",
        producerId: producer2[0].id,
        quantity: 45,
      },
    ]);

    // Produtos do Carlos (Grãos e Sementes)
    await db.insert(products).values([
      {
        title: "Feijão Preto Orgânico",
        description: "Feijão preto de alta qualidade, cultivado organicamente, rico em proteínas.",
        price: "18.50",
        category: "graos",
        producerId: producer3[0].id,
        quantity: 25,
      },
      {
        title: "Quinoa Real",
        description: "Quinoa real premium, superalimento rico em aminoácidos essenciais.",
        price: "32.90",
        category: "integrais",
        producerId: producer3[0].id,
        quantity: 15,
      },
      {
        title: "Castanha do Pará",
        description: "Castanhas do Pará frescas e crocantes, fonte natural de selênio.",
        price: "45.80",
        category: "castanhas",
        producerId: producer3[0].id,
        quantity: 10,
      },
      {
        title: "Sementes de Girassol",
        description: "Sementes de girassol torradas, snack saudável rico em vitamina E.",
        price: "12.40",
        category: "sementes",
        producerId: producer3[0].id,
        quantity: 30,
      },
      {
        title: "Arroz Integral",
        description: "Arroz integral de grão longo, fonte de fibras e nutrientes essenciais.",
        price: "14.90",
        category: "integrais",
        producerId: producer3[0].id,
        quantity: 40,
      },
    ]);

    // Produtos da Ana (Ervas e Temperos)
    await db.insert(products).values([
      {
        title: "Manjericão Roxo",
        description: "Manjericão roxo aromático, perfeito para pratos italianos e pestos especiais.",
        price: "8.90",
        category: "ervas",
        producerId: producer4[0].id,
        quantity: 20,
      },
      {
        title: "Alecrim Fresco",
        description: "Alecrim fresco com aroma intenso, ideal para carnes e assados.",
        price: "6.50",
        category: "temperos",
        producerId: producer4[0].id,
        quantity: 35,
      },
      {
        title: "Flores de Capuchinha",
        description: "Flores comestíveis de capuchinha, sabor levemente picante para decoração de pratos.",
        price: "25.90",
        category: "flores_comestiveis",
        producerId: producer4[0].id,
        quantity: 8,
      },
      {
        title: "Hortelã Pimenta",
        description: "Hortelã pimenta orgânica, refrescante e aromática para chás e drinks.",
        price: "7.20",
        category: "ervas",
        producerId: producer4[0].id,
        quantity: 25,
      },
      {
        title: "Pimenta Dedo-de-Moça",
        description: "Pimentas dedo-de-moça frescas, ardência média, ideais para molhos caseiros.",
        price: "11.80",
        category: "temperos",
        producerId: producer4[0].id,
        quantity: 15,
      },
    ]);

    // 3. Criar 3 consumidores
    console.log("👥 Criando consumidores...");

    const consumer1 = await db.insert(users).values({
      email: "consumidor1@email.com",
      passwordHash,
      role: "consumer",
      firstName: "Pedro",
      lastName: "Almeida",
      phone: "11999887766",
      cpf: "12345678901",
      birthDate: "1985-03-15",
    }).returning();

    const consumer2 = await db.insert(users).values({
      email: "consumidor2@email.com",
      passwordHash,
      role: "consumer",
      firstName: "Lucia",
      lastName: "Ferreira",
      phone: "11999887767",
      cpf: "23456789012",
      birthDate: "1990-07-22",
    }).returning();

    const consumer3 = await db.insert(users).values({
      email: "consumidor3@email.com",
      passwordHash,
      role: "consumer",
      firstName: "Roberto",
      lastName: "Mendes",
      phone: "11999887768",
      cpf: "34567890123",
      birthDate: "1978-11-08",
    }).returning();

    // Criar endereços para os consumidores
    console.log("🏠 Criando endereços dos consumidores...");
    await db.insert(addresses).values([
      {
        userId: consumer1[0].id,
        street: "Rua das Flores",
        number: "123",
        complement: "Apto 45",
        city: "São Paulo",
        state: "SP",
        country: "Brasil",
        zipCode: "01234567",
      },
      {
        userId: consumer2[0].id,
        street: "Avenida Paulista",
        number: "1000",
        city: "São Paulo",
        state: "SP",
        country: "Brasil",
        zipCode: "01310100",
      },
      {
        userId: consumer3[0].id,
        street: "Rua Augusta",
        number: "456",
        complement: "Casa 2",
        city: "São Paulo",
        state: "SP",
        country: "Brasil",
        zipCode: "01305000",
      },
    ]);

    console.log("✅ Seed concluído com sucesso!");
    console.log("📊 Resumo:");
    console.log("  - 4 produtores criados");
    console.log("  - 20 produtos criados (5 por produtor)");
    console.log("  - 3 consumidores criados");
    console.log("  - 4 carteiras de produtores criadas");
    console.log("  - 3 endereços de consumidores criados");

  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Executar o seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("🎉 Processo de seed finalizado!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha no processo de seed:", error);
      process.exit(1);
    });
}

export { seedUsers };