import express from "express";
import { Request, Response } from "express";
import { body, header, param, query } from "express-validator";
import { checkErrors } from "./utils";
import { Product } from "../models/Product";
const router = express.Router();

//inserimento prodotto
router.post(
  "/",
  body("name").exists().isString(),
  body("category").exists().isString(),
  body("subcategory").exists().isString(),
  body("price").exists().isNumeric(),
  body("rank").exists().isNumeric(),
  body("reviews").exists().isArray(),
  checkErrors,
  //isAuth,
  async (req, res) => {
    const { name, category, subcategory, price, rank, reviews } = req.body;
    const product = new Product({ name, category, subcategory, price, rank, reviews });
    const productSaved = await product.save();
    res.status(201).json(productSaved);
  }
);

//get di tutti i prodotti
router.get("/", checkErrors, async (req, res) => {
  const product = await Product.find();
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});

//trova prodotto tramite id

router.get("/:id", param("id").isMongoId(), checkErrors, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});

//trovare prodotti in base alla categoria

/*
1)
router.get(
  "/search",
  query("category").isString(),
  checkErrors,
  async (req, res) => {
    const products = await Product.find({ ...req.query });
    res.json(products);
  }
);
*/

/*
2)
router.get("/:category", param("category").isString(), checkErrors, async (req, res) => {
  const {category} = req.params;
  const product = await Product.find({category: category});
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});
*/


//cancellazione tramite id
router.delete(
  "/:id",
  //header("authorization").isJWT(),
  param("id").isMongoId(),
  checkErrors,
  //isAuth,
  async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    await Product.findByIdAndDelete(id);
    res.json({ message: "product deleted" });
  }
);

//cercare prodotti sulla base della query nella richiesta
//category, subcategory, price, rank

router.get(
  "/",
  [
    query("category").optional().isString(),
    query("subcategory").optional().isString(),
    query("price").optional().isNumeric(),
    query("rank").optional().isNumeric(),],
    checkErrors,
    async (req: Request, res: Response) => {
      const products = await Product.find({ ...req.query });
      res.json(products);
    }
);

export default router;
