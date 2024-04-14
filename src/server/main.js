import express from "express";
import ViteExpress from "vite-express";
import axios from "axios";
// import cors from "cors";

const app = express();

// app.use(cors({
//   origin: 'http://localhost:3000'
// }));

app.get("/rain-radar/12hrs", async (req, res) => {
  const baseURL = "https://www.weather2day.co.il";
  
  try {
    // Fetch weather2day current html, which contains the most updated images for the slider.
    const response = await axios.get(`${baseURL}/מכם-גשם`);
    const htmlData = response.data;
    
    // Extracts the imagesList variable which contains all the numbers that fits to an available image address:
    // https://weather2day.co.il/images/radar/1711284121.png for example
    
    const imagesListRegex = /imageslist = \[.*\]/;
    const match = htmlData.match(imagesListRegex);
    
    if (match) {
      const rawList = match[0];  
      
      // Handle potential "imageslist =" at the beginning
      // Then, remove leading '[' and trailing ']'
      const lessRawList = rawList.slice("imageslist = ".length).slice(1, -1)
      
      // Process numbers:
      // 1. split string by "," delimeter to numbers (which represents the number of seconds from world creation when the picture was taken)
      // 2. trim each number (remove extra spaces if there are any)
      // 3. turn each number to a valid src image address
      // 4. reverse the list to be from the oldest image to the most recent taken
      const imageSourcesList = lessRawList.split(',').map(num => `${baseURL}/images/radar/${num.trim()}.png`).reverse();
      
      // Debugging errors in case image is not loading or not found
      // for (let i = 0; i < 20; i++) {
        //   imageSourcesList.splice(i + 20, 0, '');
        // }
        
        res.status(200).json(imageSourcesList);
      } else {
        res.status(404).json({ message: 'Error fetching imageslist'});
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching data' });
    }
  });

  const port = 3000;
  ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on port ${port}...`),
  );
  