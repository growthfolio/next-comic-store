# 📚 Next Comic Store - Marketplace de Quadrinhos

## 🎯 Objetivo de Aprendizado
Projeto desenvolvido para estudar **Next.js 14** com **App Router**, **Prisma ORM**, **TypeScript** e **shadcn/ui**, criando um marketplace completo de quadrinhos com autenticação, carrinho de compras, painel admin e upload de imagens.

## 🛠️ Tecnologias Utilizadas
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **ORM:** Prisma
- **Banco de Dados:** SQLite
- **Estado:** React Context API
- **Data Fetching:** TanStack React Query
- **Conceitos estudados:**
  - Next.js App Router e Server Components
  - Prisma ORM e migrations
  - shadcn/ui component system
  - Context API para estado global
  - API Routes e backend integration
  - Upload de arquivos e storage

## 🚀 Demonstração
```tsx
// API Route com Prisma
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Server Component com dados
async function ProductsPage() {
  const products = await prisma.product.findMany();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Context para carrinho
const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

## 💡 Principais Aprendizados

### ⚡ Next.js 14 App Router
- **Server Components:** Renderização no servidor
- **Client Components:** Interatividade no cliente
- **API Routes:** Backend integrado
- **File-based Routing:** Roteamento automático
- **Layouts:** Layouts aninhados e compartilhados

### 🗄️ Prisma ORM
- **Schema Definition:** Modelagem de dados
- **Migrations:** Controle de versão do banco
- **Client Generation:** Type-safe database access
- **Seeding:** População inicial de dados

### 🎨 shadcn/ui + Tailwind
- **Component System:** Componentes reutilizáveis
- **Design System:** Consistência visual
- **Responsive Design:** Mobile-first approach
- **Dark Mode:** Suporte a temas

## 🧠 Conceitos Técnicos Estudados

### 1. **Prisma Schema**
```prisma
model Product {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  price       Float
  imageUrl    String?
  type        String   @default("sample")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  orderItems  OrderItem[]
  
  @@map("products")
}

model User {
  id       Int     @id @default(autoincrement())
  name     String
  email    String  @unique
  password String
  isAdmin  Boolean @default(false)
  
  orders   Order[]
  
  @@map("users")
}
```

### 2. **Server Actions**
```tsx
// Server Action para criar pedido
async function createOrder(formData: FormData) {
  'use server';
  
  const userId = formData.get('userId') as string;
  const items = JSON.parse(formData.get('items') as string);
  
  const order = await prisma.order.create({
    data: {
      userId: parseInt(userId),
      status: 'pending',
      total: calculateTotal(items),
      orderItems: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  });
  
  return order;
}
```

### 3. **Context API com TypeScript**
```tsx
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);
  
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [items]);
  
  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};
```

## 📁 Estrutura do Projeto
```
next-comic-store/
├── app/
│   ├── (auth)/             # Grupo de rotas de autenticação
│   ├── admin/              # Painel administrativo
│   ├── api/                # API Routes
│   ├── products/           # Páginas de produtos
│   ├── cart/               # Carrinho de compras
│   └── layout.tsx          # Layout principal
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   ├── cart/               # Componentes do carrinho
│   └── products/           # Componentes de produtos
├── lib/
│   ├── prisma.ts           # Cliente Prisma
│   ├── auth.ts             # Utilitários de auth
│   └── utils.ts            # Utilitários gerais
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   ├── seed.ts             # Dados iniciais
│   └── migrations/         # Migrações
└── data/
    └── database.sqlite     # Banco SQLite
```

## 🔧 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repo-url>
cd next-comic-store

# Instale dependências
npm install

# Configure o banco de dados
npx prisma migrate dev --name init
npx prisma db seed

# Inicie o servidor
npm run dev
```

### Modo Mock (Desenvolvimento)
```bash
# Crie arquivo .env
echo "USE_MOCK=true" > .env

# Reinicie o servidor
npm run dev
```

**Credenciais Mock:**
- **Admin:** admin.mock@comichub.com / password
- **Usuário:** test.mock@example.com / password

## 🎯 Funcionalidades Implementadas
- ✅ **Catálogo de produtos** com detalhes
- ✅ **Carrinho de compras** funcional
- ✅ **Autenticação** (login/registro)
- ✅ **Painel admin** para pedidos
- ✅ **Upload de imagens** (simulado)
- ✅ **Histórico de pedidos** do usuário
- ✅ **Checkout** simulado
- ✅ **Design responsivo** mobile-first

## 🚧 Desafios Enfrentados
1. **App Router:** Migração de Pages para App Router
2. **Server vs Client Components:** Entender quando usar cada um
3. **Prisma Setup:** Configuração de schema e migrations
4. **TypeScript:** Tipagem complexa com Prisma
5. **State Management:** Context API vs Server State
6. **File Upload:** Simulação de upload de imagens

## 📚 Recursos Utilizados
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📈 Próximos Passos
- [ ] Implementar autenticação com NextAuth.js
- [ ] Adicionar sistema de pagamento (Stripe)
- [ ] Implementar upload real de imagens (Cloudinary)
- [ ] Adicionar testes (Jest + Testing Library)
- [ ] Implementar notificações em tempo real
- [ ] Deploy na Vercel com PostgreSQL

## 🔗 Projetos Relacionados
- [React E-commerce](../react-ecommerce-tt/) - Comparação com React puro
- [Spring E-commerce](../spring-ecommerce-tt/) - Backend Java
- [HTML Supplement E-commerce](../html-supplement-ecommerce/) - Fundamentos web

---

**Desenvolvido por:** Felipe Macedo  
**Contato:** contato.dev.macedo@gmail.com  
**GitHub:** [FelipeMacedo](https://github.com/felipemacedo1)  
**LinkedIn:** [felipemacedo1](https://linkedin.com/in/felipemacedo1)

> 💡 **Reflexão:** Este projeto consolidou meus conhecimentos em Next.js 14 e suas novas funcionalidades. A experiência com App Router, Server Components e Prisma estabeleceu bases sólidas para desenvolvimento full-stack moderno.