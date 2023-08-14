import { Prisma, PrismaClient } from '@prisma/client'
import express, { Request, Response } from 'express'
import cors from 'cors'; // Import the cors middleware
import https from 'https';
import fs from 'fs';
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

app.patch('/api/update-rating', async (req: Request, res: Response) => {
  try {
    const { barcode, actions } = req.body;
    const validActions = ['like', 'dislike', 'removeLike', 'removeDislike'];
    let updatedProduct;

    for (const action of actions) {
      console.log('Update-Rating = ', action)
      if (!validActions.includes(action)) {
        res.status(400).json({ success: false, error: 'Invalid action' });
        return;
      }

      // Perform the necessary product updates for each action
   
      if (action === 'like') {
        updatedProduct = await prisma.product.update({
          where: { barcode: barcode },
          data: { likeCount: { increment: 1 } },
        });
      } else if (action === 'dislike') {
        updatedProduct = await prisma.product.update({
          where: { barcode: barcode },
          data: { dislikeCount: { increment: 1 } },
        });
      } else if (action === 'removeLike') {
        updatedProduct = await prisma.product.update({
          where: { barcode: barcode },
          data: { likeCount: { decrement: 1 } },
        });
      } else if (action === 'removeDislike') {
        updatedProduct = await prisma.product.update({
          where: { barcode: barcode },
          data: { dislikeCount: { decrement: 1 } },
        });
      }

    }

    res.json({ success: true, product: updatedProduct }); // Send the response after processing all actions

  } catch (error) {
    console.error('Error updating product rating:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// Read the SSL certificate and private key
const options = {
  key: fs.readFileSync('./../crt/private.key'),    // Change the path
  cert: fs.readFileSync('./../crt/certificate.crt'),    // Change the path,
  ca: fs.readFileSync('./../crt/ca_bundle.crt')
};

// Create the HTTPS server
const server = https.createServer(options, app);

const port = 3000; // Change this to the desired port for your HTTPS server

// Start the server
server.listen(port, () => {
  console.log(`
🚀 Server ready at: https://localhost:${port}
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`);
});