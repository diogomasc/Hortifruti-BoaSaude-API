import fastify from 'fastify'
import crypto from 'node:crypto'

const server = fastify()

const generateId = () => {
    return crypto.randomUUID()
}

interface Address {
    street: string
    number: string
    complement: string
    city: string
    state: string
    country: string
    zip_code: string
}

interface Producer {
    id: string
    name: string
    email: string
    password: string
    cpf: string
    phone: string
    address: Address
}

interface Product {
    id: string
    name: string
    category: string
    quantity: number
    description: string
    price: number
    producer_id: string
}

const Producers: Producer[] = []
const Products: Product[] = []

Producers.push({
    id: generateId(),
    name: 'Fernando Oliveira',
    email: 'feroliveira@example.com',
    password: '12345aA@',
    cpf: '44024281062',
    phone: '96975621742',
    address: {
        street: 'Rua 1',
        number: '123',
        complement: 'Apto 123',
        city: 'Cidade 1',
        state: 'Estado 1',
        country: 'País 1',
        zip_code: '12345678'
    }
})

Products.push({
    id: generateId(),
    name: 'Produto 1',
    category: 'Categoria 1', 
    quantity: 10,
    description: 'Descrição 1',
    price: 100,
    producer_id: Producers[0].id
})

Products.push({
    id: generateId(),
    name: 'Produto 2',
    category: 'Categoria 2',
    quantity: 15,
    description: 'Descrição 2',
    price: 75.50,
    producer_id: Producers[0].id
})

Products.push({
    id: generateId(),
    name: 'Produto 3',
    category: 'Categoria 1',
    quantity: 20,
    description: 'Descrição 3',
    price: 45.99,
    producer_id: Producers[0].id
})

server.get('/products', (req, res) => {
    res.send({
        products: Products
    })
})

server.get('/products/:id', (req, res) => {
    const productId = (req.params as { id: string }).id
    const product = Products.find(product => product.id === productId)
    if (!product) {
        return res.status(404).send({
            error: 'Produto não encontrado'
        })
    }
    
    return res.send({
        product
    })
})

server.post('/products', (req, res) => {
    const producer_id =  generateId()
    const { name, category, quantity, description, price,  } = req.body as Product

    if (!name || !category || !quantity || !price) {
        return res.status(400).send({
            error: 'Missing required fields'
        })
    }
    const newProduct: Product = {
        id: generateId(),
        name,
        category,
        quantity,
        description,
        price,
        producer_id
    }

    Products.push(newProduct)
    
    return res.status(201).send({
        product: newProduct
    })
})

const start = async () => {
    try {
        await server.listen({ port: 3333, host: '0.0.0.0' })
        console.log('Servidor rodando em: http://localhost:3333')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

start()
