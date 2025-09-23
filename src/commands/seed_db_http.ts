import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { buildApp } from "../app";

const app = buildApp();

// Função para aguardar um tempo
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Interface para dados do usuário
interface UserData {
  email: string;
  password: string;
  token?: string;
  userId?: string;
  role: "producer" | "consumer";
  userData: any;
}

// Função para criar N usuários com dados do Faker
async function createUsers(
  request: any,
  count: number,
  role: "producer" | "consumer"
): Promise<UserData[]> {
  const users: UserData[] = [];

  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const password = "123456";

    let userData: any = {
      email,
      password,
      role,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.string.numeric(11),
    };

    if (role === "producer") {
      userData = {
        ...userData,
        cnpj: faker.string.numeric(14),
        shopName: `${faker.company.name()} ${faker.commerce.department()}`,
        shopDescription: faker.commerce.productDescription(),
      };
    } else {
      userData = {
        ...userData,
        cpf: faker.string.numeric(11),
        birthDate: faker.date
          .birthdate({ min: 18, max: 80, mode: "age" })
          .toISOString()
          .split("T")[0],
      };
    }

    const response = await request.post("/register").send(userData).expect(201);

    users.push({
      email,
      password,
      role,
      userId: response.body.user.id,
      userData: response.body.user,
    });

    console.log(
      `✅ ${role === "producer" ? "Produtor" : "Consumidor"} ${
        i + 1
      } criado: ${email}`
    );
  }

  return users;
}

// Função para fazer login dos usuários
async function loginUsers(request: any, users: UserData[]): Promise<void> {
  for (const user of users) {
    const loginResponse = await request
      .post("/login")
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200);

    user.token = loginResponse.body.token;
    console.log(`🔐 Login realizado para: ${user.email}`);
  }
}

// Função para criar endereços para consumidores
async function createAddresses(
  request: any,
  consumers: UserData[]
): Promise<void> {
  for (const consumer of consumers) {
    if (consumer.role === "consumer" && consumer.token) {
      await request
        .post("/users/me/addresses")
        .set("Authorization", `Bearer ${consumer.token}`)
        .send({
          street: faker.location.streetAddress(),
          number: faker.location.buildingNumber(),
          complement:
            Math.random() > 0.5 ? faker.location.secondaryAddress() : undefined,
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          country: "Brasil",
          zipCode: faker.location.zipCode("########"),
        })
        .expect(201);

      console.log(`🏠 Endereço criado para: ${consumer.email}`);
    }
  }
}

// Função para criar produtos para produtores
async function createProducts(
  request: any,
  producers: UserData[]
): Promise<void> {
  const categories = [
    "frutas",
    "verduras",
    "legumes",
    "graos",
    "ervas",
    "temperos",
  ];

  for (const producer of producers) {
    if (producer.role === "producer" && producer.token) {
      const productCount = faker.number.int({ min: 3, max: 8 });

      for (let i = 0; i < productCount; i++) {
        await request
          .post("/products")
          .set("Authorization", `Bearer ${producer.token}`)
          .send({
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price({ min: 2, max: 50, dec: 2 }),
            category: faker.helpers.arrayElement(categories),
            quantity: faker.number.int({ min: 5, max: 100 }),
          })
          .expect(201);
      }

      console.log(
        `📦 ${productCount} produtos criados para: ${producer.email}`
      );
    }
  }
}

// URLs de imagens do Unsplash para produtos
const productImageUrls = [
  "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621956838481-f8f616950454?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1726750862897-4b75116bca34?q=80&w=867&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

// Função para baixar imagem e converter para buffer
async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Função para criar imagens aleatórias para produtos
async function createProductImages(
  request: any,
  producers: UserData[]
): Promise<void> {
  const { randomUUID } = require("crypto");

  for (const producer of producers) {
    if (producer.role === "producer" && producer.token) {
      // Obter produtos do produtor
      const productsResponse = await request
        .get("/products/me")
        .set("Authorization", `Bearer ${producer.token}`)
        .expect(200);

      const { products } = productsResponse.body;

      for (const product of products) {
        // Adicionar 1-3 imagens aleatórias para cada produto
        const imageCount = faker.number.int({ min: 1, max: 3 });

        for (let i = 0; i < imageCount; i++) {
          try {
            // Selecionar URL aleatória do Unsplash
            const randomImageUrl = faker.helpers.arrayElement(productImageUrls);

            // Baixar imagem e converter para buffer
            const imageBuffer = await downloadImageAsBuffer(randomImageUrl);
            const fileName = `${randomUUID()}.jpg`;

            // Fazer upload da imagem usando multipart/form-data
            await request
              .post(`/products/${product.id}/images`)
              .set("Authorization", `Bearer ${producer.token}`)
              .attach("file", imageBuffer, {
                filename: fileName,
                contentType: "image/jpeg",
              })
              .expect(201);
          } catch (error) {
            // Se falhar (ex: limite de imagens), continuar
            console.log(
              `⚠️  Erro ao adicionar imagem para produto ${product.title}: ${
                (error as Error).message
              }`
            );
          }
        }
      }

      console.log(`🖼️  Imagens adicionadas aos produtos de: ${producer.email}`);
    }
  }
}

export async function seedUsersHttp() {
  try {
    console.log("🌱 Iniciando seed completo via HTTP...");

    // Aguardar o app estar pronto
    await app.ready();
    const request = supertest(app.server);

    // 1. Criar produtores
    console.log("👨‍🌾 Criando produtores...");
    const producers = await createUsers(request, 4, "producer");

    // 2. Criar consumidores
    console.log("👥 Criando consumidores...");
    const consumers = await createUsers(request, 3, "consumer");

    // 3. Fazer login de todos os usuários
    console.log("🔐 Fazendo login dos usuários...");
    await loginUsers(request, [...producers, ...consumers]);

    // 4. Criar endereços para consumidores
    console.log("🏠 Criando endereços dos consumidores...");
    await createAddresses(request, consumers);

    // 5. Criar produtos para produtores
    console.log("📦 Criando produtos dos produtores...");
    await createProducts(request, producers);

    // 6. Criar imagens para produtos
    console.log("🖼️  Adicionando imagens aos produtos...");
    await createProductImages(request, producers);

    console.log("✅ Seed completo concluído com sucesso!");
    console.log("📊 Resumo:");
    console.log(`  - ${producers.length} produtores criados`);
    console.log(`  - ${consumers.length} consumidores criados`);
    console.log(`  - ${consumers.length} endereços de consumidores criados`);
    console.log(`  - Produtos criados para todos os produtores`);
    console.log(`  - Imagens adicionadas aos produtos`);
    console.log("  - Todos os usuários têm senha padrão: 123456");
    console.log("  - Emails e dados gerados aleatoriamente com Faker");
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

// Função para seed customizado com quantidade específica
export async function seedCustomHttp(
  producerCount: number = 4,
  consumerCount: number = 3
) {
  try {
    console.log(
      `🌱 Iniciando seed customizado via HTTP (${producerCount} produtores, ${consumerCount} consumidores)...`
    );

    // Aguardar o app estar pronto
    await app.ready();
    const request = supertest(app.server);

    // 1. Criar produtores
    console.log(`👨‍🌾 Criando ${producerCount} produtores...`);
    const producers = await createUsers(request, producerCount, "producer");

    // 2. Criar consumidores
    console.log(`👥 Criando ${consumerCount} consumidores...`);
    const consumers = await createUsers(request, consumerCount, "consumer");

    // 3. Fazer login de todos os usuários
    console.log("🔐 Fazendo login dos usuários...");
    await loginUsers(request, [...producers, ...consumers]);

    // 4. Criar endereços para consumidores
    console.log("🏠 Criando endereços dos consumidores...");
    await createAddresses(request, consumers);

    // 5. Criar produtos para produtores
    console.log("📦 Criando produtos dos produtores...");
    await createProducts(request, producers);

    // 6. Criar imagens para produtos
    console.log("🖼️  Adicionando imagens aos produtos...");
    await createProductImages(request, producers);

    console.log("✅ Seed customizado concluído com sucesso!");
    console.log("📊 Resumo:");
    console.log(`  - ${producers.length} produtores criados`);
    console.log(`  - ${consumers.length} consumidores criados`);
    console.log(`  - ${consumers.length} endereços de consumidores criados`);
    console.log(`  - Produtos criados para todos os produtores`);
    console.log(`  - Imagens adicionadas aos produtos`);
    console.log("  - Todos os usuários têm senha padrão: 123456");
    console.log("  - Emails e dados gerados aleatoriamente com Faker");

    return { producers, consumers };
  } catch (error) {
    console.error("❌ Erro durante o seed customizado:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // Verificar se foram passados argumentos para quantidade customizada
  const args = process.argv.slice(2);
  const producerCount = args[0] ? parseInt(args[0]) : 4;
  const consumerCount = args[1] ? parseInt(args[1]) : 3;

  if (args.length > 0) {
    console.log(
      `🎯 Executando seed customizado: ${producerCount} produtores, ${consumerCount} consumidores`
    );
    seedCustomHttp(producerCount, consumerCount)
      .then(() => {
        console.log("🎉 Seed customizado finalizado!");
        process.exit(0);
      })
      .catch((error) => {
        console.error("💥 Falha no seed customizado:", error);
        process.exit(1);
      });
  } else {
    seedUsersHttp()
      .then(() => {
        console.log("🎉 Seed padrão finalizado!");
        process.exit(0);
      })
      .catch((error) => {
        console.error("💥 Falha no seed:", error);
        process.exit(1);
      });
  }
}
