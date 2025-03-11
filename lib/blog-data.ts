export type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  authorImage?: string;
  authorBio?: string;
  category: string;
  image: string;
  slug: string;
  readTime?: string;
  featured?: boolean;
  relatedPosts?: number[];
  tags?: string[];
};

// This would typically come from a CMS or API
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Future of Smart Home Technology",
    excerpt:
      "Discover how the latest smart home devices are revolutionizing everyday living with AI-powered assistants, automated routines, and seamless integration across platforms.",
    content: `
      <p>Smart home technology has come a long way in recent years, transforming our living spaces into interconnected hubs of convenience and efficiency. From voice-activated assistants to automated lighting systems, the possibilities seem endless.</p>

      <h2>The Rise of AI Assistants</h2>
      <p>AI-powered assistants like Amazon's Alexa, Google Assistant, and Apple's Siri have become central to the smart home experience. These virtual helpers can control other smart devices, answer questions, play music, and even make calls or send messages.</p>

      <p>The latest generation of these assistants features more natural language processing capabilities, allowing for more conversational interactions. They're also becoming better at understanding context and remembering preferences, making the experience more personalized.</p>

      <h2>Interconnected Ecosystems</h2>
      <p>One of the most significant developments in smart home technology is the move toward more unified ecosystems. Standards like Matter and Thread are helping to ensure that devices from different manufacturers can work together seamlessly.</p>

      <p>This interoperability is crucial for creating truly automated homes where devices can communicate with each other without user intervention. Imagine your smart thermostat adjusting based on data from occupancy sensors, or your lights automatically dimming when you start watching a movie.</p>

      <h2>Energy Efficiency</h2>
      <p>Smart home technology isn't just about convenience—it's also about sustainability. Smart thermostats, energy monitors, and automated lighting can significantly reduce energy consumption.</p>

      <p>Some systems can even integrate with solar panels and home batteries, optimizing energy usage based on production and storage capacity. This kind of intelligent energy management will become increasingly important as we transition to renewable energy sources.</p>

      <h2>The Future is Bright</h2>
      <p>As we look to the future, we can expect smart home technology to become even more intuitive and integrated into our daily lives. Advances in AI and machine learning will enable systems that can predict our needs and adapt to our behaviors.</p>

      <p>The smart home of tomorrow won't just respond to commands—it will anticipate them, creating living spaces that are not only more convenient but also more comfortable, efficient, and personalized than ever before.</p>
    `,
    date: "May 15, 2024",
    author: "Alex Johnson",
    authorImage: "/blog.jpg",
    authorBio:
      "Alex is a technology writer specializing in smart home and IoT innovations.",
    category: "Smart Home",
    image: "/blog.jpg",
    slug: "future-of-smart-home-technology",
    readTime: "8 min read",
    featured: true,
    relatedPosts: [2, 4, 5],
    tags: [
      "smart home",
      "IoT",
      "AI assistants",
      "home automation",
      "Matter",
      "Thread",
    ],
  },
  {
    id: 2,
    title: "Top 5 Wireless Earbuds for 2024",
    excerpt:
      "We compare the best wireless earbuds on the market to help you find your perfect match based on sound quality, battery life, and comfort.",
    content: `
      <p>Wireless earbuds have become essential accessories for many tech enthusiasts and casual users alike. With so many options on the market, finding the right pair can be challenging. In this article, we'll compare the top 5 wireless earbuds of 2024 to help you make an informed decision.</p>

      <h2>1. SoundCore Pro X</h2>
      <p>The SoundCore Pro X earbuds offer exceptional sound quality with deep bass and crystal-clear highs. With active noise cancellation and transparency mode, these earbuds are perfect for both commuting and office use.</p>
      <p>Battery life: 10 hours (30 hours with case)</p>
      <p>Price: $149.99</p>

      <h2>2. AudioBeam Elite</h2>
      <p>AudioBeam Elite earbuds feature a unique spatial audio technology that creates an immersive listening experience. They're particularly good for watching movies or playing games.</p>
      <p>Battery life: 8 hours (24 hours with case)</p>
      <p>Price: $199.99</p>

      <h2>3. TechBuds Air</h2>
      <p>TechBuds Air are the most comfortable earbuds we've tested, with a lightweight design and multiple ear tip options. They're perfect for long listening sessions.</p>
      <p>Battery life: 7 hours (28 hours with case)</p>
      <p>Price: $129.99</p>

      <h2>4. SoundWave Pro</h2>
      <p>SoundWave Pro earbuds offer the best value for money, with premium features at a mid-range price. They include active noise cancellation, water resistance, and good sound quality.</p>
      <p>Battery life: 9 hours (27 hours with case)</p>
      <p>Price: $99.99</p>

      <h2>5. PulseAudio Pods</h2>
      <p>PulseAudio Pods stand out with their exceptional microphone quality, making them the best choice for calls and video conferences. They also feature good sound quality for music.</p>
      <p>Battery life: 6 hours (24 hours with case)</p>
      <p>Price: $159.99</p>

      <h2>Conclusion</h2>
      <p>Each of these wireless earbuds offers something unique, so the best choice depends on your specific needs. For the best overall experience, we recommend the SoundCore Pro X, while budget-conscious shoppers should consider the SoundWave Pro.</p>
    `,
    date: "May 10, 2024",
    author: "Sarah Chen",
    authorImage: "/blog.jpg",
    authorBio:
      "Sarah is an audio enthusiast and product reviewer with over 10 years of experience.",
    category: "Audio",
    image: "/blog.jpg",
    slug: "top-5-wireless-earbuds-2024",
    readTime: "10 min read",
    featured: false,
    relatedPosts: [1, 3, 6],
    tags: [
      "wireless earbuds",
      "audio",
      "headphones",
      "product review",
      "bluetooth",
    ],
  },
  {
    id: 3,
    title: "How to Choose the Right Gaming Monitor",
    excerpt:
      "Resolution, refresh rate, response time - we break down what really matters when selecting a gaming monitor for competitive or casual play.",
    content: `<p>Detailed content about gaming monitors would go here...</p>`,
    date: "May 5, 2024",
    author: "Marcus Williams",
    authorImage: "/blog.jpg",
    authorBio: "Marcus is a professional esports player and tech reviewer.",
    category: "Gaming",
    image: "/blog.jpg",
    slug: "choose-right-gaming-monitor",
    readTime: "7 min read",
    featured: false,
    relatedPosts: [2, 5, 6],
    tags: [
      "gaming",
      "monitors",
      "displays",
      "refresh rate",
      "response time",
      "resolution",
    ],
  },
  {
    id: 4,
    title: "The Rise of Foldable Smartphones",
    excerpt:
      "Are foldable smartphones the future of mobile technology? We explore the pros, cons, and innovations in this emerging category.",
    content: `<p>Detailed content about foldable smartphones would go here...</p>`,
    date: "April 28, 2024",
    author: "Priya Patel",
    authorImage: "/blog.jpg",
    authorBio:
      "Priya is a mobile technology analyst and former smartphone engineer.",
    category: "Smartphones",
    image: "/blog.jpg",
    slug: "rise-of-foldable-smartphones",
    readTime: "9 min read",
    featured: true,
    relatedPosts: [1, 5, 6],
    tags: [
      "smartphones",
      "foldable phones",
      "mobile technology",
      "Samsung",
      "innovation",
    ],
  },
  {
    id: 5,
    title: "Building Your First Custom PC: A Beginner's Guide",
    excerpt:
      "Step-by-step instructions for assembling your first custom PC, from selecting components to final setup.",
    content: `<p>Detailed content about building a PC would go here...</p>`,
    date: "April 20, 2024",
    author: "David Kim",
    authorImage: "/blog.jpg",
    authorBio: "David is a computer hardware specialist and custom PC builder.",
    category: "Computing",
    image: "/blog.jpg",
    slug: "building-first-custom-pc-guide",
    readTime: "15 min read",
    featured: false,
    relatedPosts: [1, 3, 4],
    tags: ["PC building", "custom PC", "computer hardware", "DIY", "gaming PC"],
  },
  {
    id: 6,
    title: "Are OLED TVs Worth the Premium Price?",
    excerpt:
      "We analyze whether the superior picture quality of OLED TVs justifies their higher cost compared to LED and QLED alternatives.",
    content: `<p>Detailed content about OLED TVs would go here...</p>`,
    date: "April 15, 2024",
    author: "Emma Rodriguez",
    authorImage: "/blog.jpg",
    authorBio:
      "Emma is a display technology expert and home theater enthusiast.",
    category: "TVs",
    image: "/blog.jpg",
    slug: "are-oled-tvs-worth-premium-price",
    readTime: "11 min read",
    featured: false,
    relatedPosts: [1, 2, 4],
    tags: ["OLED", "TVs", "display technology", "home theater", "QLED", "LED"],
  },
];

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getRecentPosts(count = 3): BlogPost[] {
  // Sort by date (newest first) and take the specified count
  return [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

export function getRelatedPosts(postId: number): BlogPost[] {
  const post = blogPosts.find((p) => p.id === postId);
  if (!post || !post.relatedPosts) return [];

  return post.relatedPosts
    .map((id) => blogPosts.find((p) => p.id === id))
    .filter(Boolean) as BlogPost[];
}

export function getAllCategories(): string[] {
  return [...new Set(blogPosts.map((post) => post.category))];
}

export function getAllTags(): string[] {
  const allTags = blogPosts.flatMap((post) => post.tags || []);
  return [...new Set(allTags)];
}

export function searchPosts(query: string): BlogPost[] {
  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 0);

  if (searchTerms.length === 0) return blogPosts;

  return blogPosts.filter((post) => {
    const searchableText = `
      ${post.title.toLowerCase()}
      ${post.excerpt.toLowerCase()}
      ${post.content.toLowerCase()}
      ${post.author.toLowerCase()}
      ${post.category.toLowerCase()}
      ${(post.tags || []).join(" ").toLowerCase()}
      ${extractHeadings(post.content).join(" ").toLowerCase()}
    `;

    return searchTerms.every((term) => searchableText.includes(term));
  });
}

function extractHeadings(content: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g;
  const headings: string[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1]);
  }
  return headings;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
