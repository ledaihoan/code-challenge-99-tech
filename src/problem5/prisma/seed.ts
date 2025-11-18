import { PrismaClient } from '@prisma/client';
// @ts-ignore
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Technology',
    slug: 'technology',
    children: [
      { name: 'Programming', slug: 'programming' },
      { name: 'Web Development', slug: 'web-development' },
      { name: 'Mobile Apps', slug: 'mobile-apps' },
      { name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
    ],
  },
  {
    name: 'Business',
    slug: 'business',
    children: [
      { name: 'Startups', slug: 'startups' },
      { name: 'Marketing', slug: 'marketing' },
      { name: 'Finance', slug: 'finance' },
    ],
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    children: [
      { name: 'Travel', slug: 'travel' },
      { name: 'Food & Cooking', slug: 'food-cooking' },
      { name: 'Health & Fitness', slug: 'health-fitness' },
      { name: 'Fashion', slug: 'fashion' },
    ],
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    children: [
      { name: 'Movies', slug: 'movies' },
      { name: 'Music', slug: 'music' },
      { name: 'Gaming', slug: 'gaming' },
    ],
  },
  {
    name: 'Education',
    slug: 'education',
    children: [
      { name: 'Online Courses', slug: 'online-courses' },
      { name: 'Tutorials', slug: 'tutorials' },
      { name: 'Books', slug: 'books' },
    ],
  },
];

const posts = [
  {
    title: 'Getting Started with TypeScript in 2024',
    description: 'Learn the fundamentals of TypeScript and why it matters for modern development.',
    body: 'TypeScript has become an essential tool for JavaScript developers. It provides static typing, better IDE support, and catches errors before runtime. In this guide, we will explore the basics of TypeScript, including types, interfaces, and generics. Whether you are building a small project or a large-scale application, TypeScript can help you write more maintainable code.',
    tags: ['typescript', 'javascript', 'programming', 'tutorial'],
    category: 'technology/programming',
  },
  {
    title: 'Building RESTful APIs with Express and Prisma',
    description: 'A comprehensive guide to creating scalable backend services.',
    body: 'Express.js combined with Prisma ORM offers a powerful stack for building modern APIs. This tutorial covers setting up your project, defining database schemas, implementing CRUD operations, and adding authentication. We will also discuss best practices for error handling, validation, and structuring your codebase for scalability.',
    tags: ['express', 'prisma', 'nodejs', 'api', 'backend'],
    category: 'technology/web-development',
  },
  {
    title: 'React Native vs Flutter: Which Should You Choose?',
    description: 'Comparing two popular cross-platform mobile frameworks.',
    body: 'Choosing between React Native and Flutter depends on your team and project requirements. React Native uses JavaScript and offers a familiar development experience for web developers. Flutter uses Dart and provides excellent performance with its widget-based architecture. In this article, we compare developer experience, performance, community support, and use cases for both frameworks.',
    tags: ['react-native', 'flutter', 'mobile', 'comparison'],
    category: 'technology/mobile-apps',
  },
  {
    title: 'Introduction to Machine Learning with Python',
    description: 'Start your journey into artificial intelligence and data science.',
    body: 'Machine learning is transforming industries from healthcare to finance. Python, with libraries like scikit-learn, TensorFlow, and PyTorch, makes it accessible to beginners. This guide introduces key concepts like supervised learning, neural networks, and model evaluation. We will build a simple classifier and discuss how to improve model accuracy.',
    tags: ['python', 'machine-learning', 'ai', 'data-science'],
    category: 'technology/ai-machine-learning',
  },
  {
    title: 'How to Validate Your Startup Idea',
    description: 'Steps to test your business concept before building.',
    body: 'Many startups fail because they build products nobody wants. Validation is crucial before investing time and money. Start by identifying your target audience and their pain points. Conduct interviews, create landing pages, and run small experiments to gauge interest. This article provides a framework for validating ideas quickly and efficiently.',
    tags: ['startup', 'entrepreneurship', 'validation', 'mvp'],
    category: 'business/startups',
  },
  {
    title: 'Content Marketing Strategies That Actually Work',
    description: 'Proven tactics to grow your audience and drive conversions.',
    body: 'Content marketing is more than just blogging. It requires a strategic approach to create value for your audience. Focus on understanding your customer journey, creating high-quality content, and distributing it through the right channels. We will explore SEO optimization, email marketing, and social media strategies that help you reach your business goals.',
    tags: ['marketing', 'content', 'seo', 'strategy'],
    category: 'business/marketing',
  },
  {
    title: 'Personal Finance Tips for Young Professionals',
    description: 'Build wealth and financial security early in your career.',
    body: 'Starting your career is the perfect time to develop good financial habits. Create a budget, build an emergency fund, and start investing early. Take advantage of compound interest by contributing to retirement accounts. Avoid lifestyle inflation and unnecessary debt. This guide covers practical steps to achieve financial independence.',
    tags: ['finance', 'investing', 'budgeting', 'career'],
    category: 'business/finance',
  },
  {
    title: 'Top 10 Destinations for Digital Nomads in 2024',
    description: 'Explore the best cities for remote work and adventure.',
    body: 'Digital nomadism offers the freedom to work from anywhere. Cities like Lisbon, Bali, and Medellín combine affordable living, reliable internet, and vibrant communities. We explore visa options, cost of living, coworking spaces, and local culture in each destination. Whether you prefer beaches or mountains, there is a perfect spot for your remote work lifestyle.',
    tags: ['travel', 'digital-nomad', 'remote-work', 'lifestyle'],
    category: 'lifestyle/travel',
  },
  {
    title: 'Easy Weeknight Dinner Recipes for Busy People',
    description: 'Delicious meals you can prepare in under 30 minutes.',
    body: 'Cooking at home does not have to be time-consuming. With proper planning and simple recipes, you can enjoy nutritious meals even on busy weeknights. This collection features quick pasta dishes, stir-fries, and one-pan meals that require minimal cleanup. We also share meal prep tips to save time throughout the week.',
    tags: ['cooking', 'recipes', 'meal-prep', 'quick-meals'],
    category: 'lifestyle/food-cooking',
  },
  {
    title: 'Strength Training for Beginners: A Complete Guide',
    description: 'Build muscle and improve your health with proper training.',
    body: 'Strength training offers numerous benefits including increased muscle mass, better bone density, and improved metabolism. Beginners should focus on compound movements like squats, deadlifts, and bench press. Start with lighter weights to master form before progressing. This guide covers workout routines, nutrition basics, and common mistakes to avoid.',
    tags: ['fitness', 'strength-training', 'workout', 'health'],
    category: 'lifestyle/health-fitness',
  },
  {
    title: 'Minimalist Fashion: Building a Capsule Wardrobe',
    description: 'Look great with fewer clothes and more versatility.',
    body: 'A capsule wardrobe simplifies your life and helps you develop personal style. Focus on quality over quantity by investing in timeless pieces that mix and match easily. Choose neutral colors and classic cuts that work for multiple occasions. This approach reduces decision fatigue and promotes sustainable fashion choices.',
    tags: ['fashion', 'minimalism', 'style', 'wardrobe'],
    category: 'lifestyle/fashion',
  },
  {
    title: 'Best Movies of 2024: A Year in Review',
    description: 'From blockbusters to indie gems, the films that defined the year.',
    body: 'This year delivered outstanding cinema across all genres. We saw groundbreaking visual effects, compelling storytelling, and powerful performances. This review covers the biggest releases, surprise hits, and critically acclaimed films. Whether you love action, drama, or comedy, 2024 had something for everyone.',
    tags: ['movies', 'film', 'review', 'entertainment'],
    category: 'entertainment/movies',
  },
  {
    title: 'The Evolution of Hip-Hop: From the 90s to Today',
    description: 'How the genre transformed music and culture worldwide.',
    body: 'Hip-hop has evolved from underground movement to global phenomenon. The genre influences fashion, language, and social movements. From the golden age of the 90s through the streaming era, hip-hop continues to push boundaries. This article traces key moments, influential artists, and how production techniques have changed over decades.',
    tags: ['music', 'hip-hop', 'culture', 'history'],
    category: 'entertainment/music',
  },
  {
    title: 'Indie Games Worth Playing in 2024',
    description: 'Hidden gems that offer unique gaming experiences.',
    body: 'While AAA games dominate headlines, indie developers create innovative experiences with creative freedom. This year brought incredible indie titles featuring unique art styles, compelling narratives, and experimental gameplay. We highlight standout games across platforms, from puzzle adventures to atmospheric exploration games that deserve your attention.',
    tags: ['gaming', 'indie-games', 'reviews', 'recommendations'],
    category: 'entertainment/gaming',
  },
  {
    title: 'Learning Web Development: Free Resources and Roadmap',
    description: 'Your guide to becoming a self-taught developer.',
    body: 'Web development is one of the most accessible tech careers with abundant free learning resources. Start with HTML, CSS, and JavaScript fundamentals before exploring frameworks. Platforms like freeCodeCamp, MDN, and YouTube offer comprehensive tutorials. Build projects to practice skills and create a portfolio. This roadmap guides you from beginner to job-ready.',
    tags: ['web-development', 'learning', 'self-taught', 'career'],
    category: 'education/online-courses',
  },
  {
    title: 'Docker Tutorial: Containerize Your Applications',
    description: 'Master containerization for consistent development environments.',
    body: 'Docker simplifies application deployment by packaging code and dependencies into containers. This tutorial covers Docker basics, writing Dockerfiles, docker-compose for multi-container apps, and best practices. Learn how to containerize Node.js applications, manage volumes, and optimize image sizes for production.',
    tags: ['docker', 'devops', 'tutorial', 'containers'],
    category: 'education/tutorials',
  },
  {
    title: 'Must-Read Books for Software Engineers',
    description: 'Essential reading to level up your programming skills.',
    body: 'Great books provide timeless insights that transcend specific technologies. Clean Code teaches principles for writing maintainable software. Design Patterns offers solutions to common problems. The Pragmatic Programmer shares wisdom on career development. This curated list covers fundamentals, architecture, and professional growth.',
    tags: ['books', 'programming', 'software-engineering', 'learning'],
    category: 'education/books',
  },
  {
    title: 'GraphQL vs REST: Choosing the Right API Architecture',
    description: 'Understanding the trade-offs between two popular approaches.',
    body: 'GraphQL offers flexible data fetching while REST provides simplicity and caching benefits. GraphQL excels when clients need varied data shapes and want to minimize requests. REST works well for simple CRUD operations and leveraging HTTP caching. This comparison helps you choose based on project requirements and team expertise.',
    tags: ['graphql', 'rest', 'api', 'architecture'],
    category: 'technology/web-development',
  },
  {
    title: 'Building a Personal Brand as a Developer',
    description: 'Stand out in the tech industry and advance your career.',
    body: 'A strong personal brand opens doors to opportunities. Share knowledge through blogging, speaking, or open source contributions. Be consistent across platforms and focus on your unique perspective. Engage authentically with the community and help others learn. Building reputation takes time but pays dividends throughout your career.',
    tags: ['career', 'personal-brand', 'developer', 'networking'],
    category: 'business/marketing',
  },
  {
    title: 'Understanding Database Indexing and Performance',
    description: 'Optimize queries and improve application speed.',
    body: 'Database performance often hinges on proper indexing. Indexes speed up reads but slow down writes. Understand when to use B-tree indexes, covering indexes, and partial indexes. Use EXPLAIN to analyze query plans and identify bottlenecks. This guide covers PostgreSQL and MySQL indexing strategies with real-world examples.',
    tags: ['database', 'performance', 'indexing', 'optimization'],
    category: 'technology/programming',
  },
];

async function seed() {
  console.log('Seeding categories...');

  const categoryMap = new Map();

  for (const category of categories) {
    const parent = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        fullPathName: category.name,
      },
    });

    categoryMap.set(category.slug, parent.id);

    if (category.children) {
      for (const child of category.children) {
        const childCategory = await prisma.category.create({
          data: {
            name: child.name,
            slug: `${category.slug}/${child.slug}`,
            fullPathName: `${parent.name} > ${child.name}`,
            parentId: parent.id,
          },
        });
        categoryMap.set(`${category.slug}/${child.slug}`, childCategory.id);
      }
    }
  }

  console.log('Seeding users...');

  const passwordHash = await bcrypt.hash('P@ssw0rd123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true,
      },
    }),
  ]);

  console.log('Seeding posts...');

  for (let i = 0; i < users.length; i++) {
    const userPosts = posts.slice(i * 10, (i + 1) * 10);

    for (const post of userPosts) {
      const categoryId = categoryMap.get(post.category);
      if (!categoryId) {
        console.warn(`Category ${post.category} not found, skipping post`);
        continue;
      }

      await prisma.post.create({
        data: {
          userId: users[i].id,
          categoryId,
          title: post.title,
          description: post.description,
          body: post.body,
          tags: post.tags,
        },
      });
    }
  }

  console.log('Seeding completed!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
