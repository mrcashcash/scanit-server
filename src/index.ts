import { Prisma, PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import cors from 'cors'; // Import the cors middleware

// interface Product {


//     barcode :    string;
//     name  :      string;
//     description: string;
//     price   :    number;
//     manufacturer?: string;
//     manufacturerId  :  number;
//     importer      :  string;
//     category     :   string;
//     originCountry :  string;
//     imageUrl    :    string;
//     likeCount :  number ;
//     dislikeCount: number;


// }

const prisma = new PrismaClient()
const app = express()
app.use(cors()); // Use the cors middleware to enable CORS

app.use(express.json({limit: '50mb'}));


// POST /api/scan
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;
    console.log('New Barcode Scan  --- > ',barcode);
    // Step 2: Check if the product exists in the database
    const product = await prisma.product.findUnique({
      where: {
        barcode: barcode,
      },
    });

    if (!product) {
      // Step 3: If the product does not exist, add it to the database
      // const newProduct = await prisma.product.create({
      //   data: {
      //     barcode: barcode,
      //   },
      // });
      res.json({ success: true, product: product });
    } else {
      // Step 5: Return the product details as the API response if the product exists
      res.json({ success: true, product });
    }
  } catch (error) {
    console.error('Error handling barcode scan:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// POST /api/add-product
app.post('/api/add-product', async (req: Request, res: Response) => {
  console.log("New product added  --> ", req.body.name);
  try {
    const {
      barcode,
      name,
      description,
      price,
      manufacturerId,
      importer,
      category,
      originCountry,
      imageUrl,
    } = req.body;

    // Step 1: Check if the product with the given barcode already exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        barcode: barcode,
      },
    });

    if (existingProduct) {
      // If the product already exists, return an error response
      res.status(400).json({ success: false, error: 'Product with the same barcode already exists' });
    } else {
      // Step 2: Add the new product to the database
      const newProduct = await prisma.product.create({
        data: {
          barcode: barcode,
          name: name,
          description: description,
          price: parseFloat(price),
          manufacturerId: manufacturerId,
          importer: importer,
          category: category,
          originCountry: originCountry,
          imageUrl: imageUrl,
        },
      });

      // Step 3: Return the newly added product details as the API response
      res.json({ success: true, product: newProduct });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
// POST /api/update-product
app.post('/api/update-product', async (req: Request, res: Response) => {
  console.log("Product update requested --> ", req.body.barcode);
  try {
    const {
      barcode,
      name,
      description,
      price ,
      manufacturerId,
      importer,
      category,
      originCountry,
      imageUrl,
    } = req.body

    // Step 1: Check if the product with the given barcode exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        barcode: barcode,
      },
    });

    if (!existingProduct) {
      // If the product does not exist, return an error response
      res.status(404).json({ success: false, error: 'Product with the given barcode not found' });
    } else {
      // Step 2: Update the existing product in the database
      const updatedProduct = await prisma.product.update({
        where: {
          barcode: barcode,
        },
        data: {
          name: name,
          description: description,
          price: parseFloat(price),
          manufacturerId: manufacturerId,
          importer: importer,
          category: category,
          originCountry: originCountry,
          imageUrl: imageUrl,
        },
      });

      // Step 3: Return the updated product details as the API response
      res.json({ success: true, product: updatedProduct });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
)
// app.post(`/signup`, async (req, res) => {
//   const { name, email, posts } = req.body

//   const postData = posts?.map((post: Prisma.PostCreateInput) => {
//     return { title: post?.title, content: post?.content }
//   })

//   const result = await prisma.user.create({
//     data: {
//       name,
//       email,
//       posts: {    ////////////// const numericPrice = parseFloat(price);

//         create: postData,
//       },
//     },
//   })
//   res.json(result)
// })

// app.post(`/post`, async (req, res) => {
//   const { title, content, authorEmail } = req.body
//   const result = await prisma.post.create({
//     data: {
//       title,
//       content,
//       author: { connect: { email: authorEmail } },
//     },
//   })
//   res.json(result)
// })

// app.put('/post/:id/views', async (req, res) => {
//   const { id } = req.params

//   try {
//     const post = await prisma.post.update({
//       where: { id: Number(id) },
//       data: {
//         viewCount: {
//           increment: 1,
//         },
//       },
//     })

//     res.json(post)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.put('/publish/:id', async (req, res) => {
//   const { id } = req.params

//   try {
//     const postData = await prisma.post.findUnique({
//       where: { id: Number(id) },
//       select: {
//         published: true,
//       },
//     })

//     const updatedPost = await prisma.post.update({
//       where: { id: Number(id) || undefined },
//       data: { published: !postData?.published },
//     })
//     res.json(updatedPost)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.delete(`/post/:id`, async (req, res) => {
//   const { id } = req.params
//   const post = await prisma.post.delete({
//     where: {
//       id: Number(id),
//     },
//   })
//   res.json(post)
// })

// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.json(users)
// })

// app.get('/user/:id/drafts', async (req, res) => {
//   const { id } = req.params

//   const drafts = await prisma.user
//     .findUnique({
//       where: {
//         id: Number(id),
//       },
//     })
//     .posts({
//       where: { published: false },
//     })

//   res.json(drafts)
// })

// app.get(`/post/:id`, async (req, res) => {
//   const { id }: { id?: string } = req.params

//   const post = await prisma.post.findUnique({
//     where: { id: Number(id) },
//   })
//   res.json(post)
// })

// app.get('/feed', async (req, res) => {
//   const { searchString, skip, take, orderBy } = req.query

//   const or: Prisma.PostWhereInput = searchString
//     ? {
//         OR: [
//           { title: { contains: searchString as string } },
//           { content: { contains: searchString as string } },
//         ],
//       }
//     : {}

//   const posts = await prisma.post.findMany({
//     where: {
//       published: true,
//       ...or,
//     },
//     include: { author: true },
//     take: Number(take) || undefined,
//     skip: Number(skip) || undefined,
//     orderBy: {
//       updatedAt: orderBy as Prisma.SortOrder,
//     },
//   })

//   res.json(posts)
// })


