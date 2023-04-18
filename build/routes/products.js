"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const utils_1 = require("./utils");
const Product_1 = require("../models/Product");
const router = express_1.default.Router();
//inserimento prodotto
router.post("/", (0, express_validator_1.body)("name").exists().isString(), (0, express_validator_1.body)("category").exists().isString(), (0, express_validator_1.body)("subcategory").exists().isString(), (0, express_validator_1.body)("price").exists().isNumeric(), (0, express_validator_1.body)("rank").exists().isNumeric(), (0, express_validator_1.body)("reviews").exists().isArray(), utils_1.checkErrors, 
//isAuth,
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category, subcategory, price, rank, reviews } = req.body;
    const product = new Product_1.Product({ name, category, subcategory, price, rank, reviews });
    const productSaved = yield product.save();
    res.status(201).json(productSaved);
}));
//get di tutti i prodotti
router.get("/", utils_1.checkErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product_1.Product.find();
    if (!product) {
        return res.status(404).json({ message: "product not found" });
    }
    res.json(product);
}));
//trova prodotto tramite id
router.get("/:id", (0, express_validator_1.param)("id").isMongoId(), utils_1.checkErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = yield Product_1.Product.findById(id);
    if (!product) {
        return res.status(404).json({ message: "product not found" });
    }
    res.json(product);
}));
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
router.delete("/:id", 
//header("authorization").isJWT(),
(0, express_validator_1.param)("id").isMongoId(), utils_1.checkErrors, 
//isAuth,
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = yield Product_1.Product.findById(id);
    if (!product) {
        return res.status(404).json({ message: "product not found" });
    }
    yield Product_1.Product.findByIdAndDelete(id);
    res.json({ message: "product deleted" });
}));
//cercare prodotti sulla base della query nella richiesta
//category, subcategory, price, rank
router.get("/", [
    (0, express_validator_1.query)("category").optional().isString(),
    (0, express_validator_1.query)("subcategory").optional().isString(),
    (0, express_validator_1.query)("price").optional().isNumeric(),
    (0, express_validator_1.query)("rank").optional().isNumeric(),
], utils_1.checkErrors, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.Product.find(Object.assign({}, req.query));
    res.json(products);
}));
exports.default = router;
