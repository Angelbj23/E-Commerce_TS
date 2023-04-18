import request from "supertest";
require("chai").should();
import { app } from "../app";
import { Product } from "../models/Product";

const basicUrl = "/v1/products";

// Definizione della suite di test per i prodotti
describe.only("products", () => {
  // Definizione di un oggetto prodotto per l'utilizzo nei test
  const product = {
    name: "iphone14",
    category: "smartphone",
    subcategory: "apple",
    price: 800,
    rank: 5.0,
    reviews: ["bello", "costoso"]
  };
  
  describe("create product", () => {
    let id: string;
    // Prima di ogni test, cancella il prodotto creato in questo blocco di test
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    // Test di fallimento per codice di stato 401 (unauthorized)
    it("failed test 401", async () => {
      const { status } = await request(app).post(basicUrl).send(product);
      status.should.be.equal(401);
    });
    // Test di successo per codice di stato 201 (created)
    it("success test 201", async () => {
      // Effettua la richiesta POST al server per creare un nuovo prodotto
      const { status, body } = await request(app)
        .post(basicUrl)
        .send(product);
      // Verifica che il codice di stato della risposta sia 201
      status.should.be.equal(201);
      // Verifica che la risposta contenga i dati del prodotto appena creato
      body.should.have.property("_id");
      body.should.have.property("name").equal(product.name);
      body.should.have.property("category").equal(product.category);
      body.should.have.property("subcategory").equal(product.subcategory);
      body.should.have.property("price").equal(product.price);
      body.should.have.property("rank").equal(product.rank);
      body.should.have.property("reviews").equal(product.reviews);
      // Salva l'ID del prodotto creato in questo test per poterlo cancellare dopo
      id = body._id;
    });
  });

  describe("delete product", () => {
    let id: string;
    // Prima di ogni test viene creato un prodotto e ne viene salvato l'id
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    // Testa il caso in cui la richiesta non ha l'autorizzazione corretta
    it("test failed 401", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(401);
    });
    // Testa il caso di successo nella cancellazione di un prodotto
    it("test success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`);
      status.should.be.equal(200);
    });
  });

  describe("get product", () => {
    let id: string;
    // Crea un nuovo prodotto prima di ogni test e salva il suo id
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    // Dopo ogni test, cancella il prodotto creato in precedenza
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    // Dopo ogni test, cancella il prodotto creato in precedenza
    it("test success 200", async () => {
      const { status, body } = await request(app).get(`${basicUrl}/${id}`);
      status.should.be.equal(200);
          body.should.have.property("_id");
          body.should.have.property("name").equal(product.name);
          body.should.have.property("category").equal(product.category);
          body.should.have.property("subcategory").equal(product.subcategory);
          body.should.have.property("price").equal(product.price);
          body.should.have.property("rank").equal(product.rank);
          body.should.have.property("reviews").equal(product.reviews);
    });
    // Testa il caso in cui l'id del prodotto non è valido e la richiesta fallisce (404 Not Found)
    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
      status.should.be.equal(404);
    });
  });

  describe("get products", () => {
    let ids: string[] = [];
    const products = [
      {
      name: "iphone14",
      category: "smartphone",
      subcategory: "apple",
      price: 800,
      rank: 5.0,
      reviews: ["bello", "costoso"]
      },

      {
        name: "iphoneX",
        category: "smartphone",
        subcategory: "apple",
        price: 800,
        rank: 5.0,
        reviews: ["bello", "costoso"]
        },
        
        {
          name: "iphone15",
          category: "smartphone",
          subcategory: "apple",
          price: 800,
          rank: 5.0,
          reviews: ["bello", "costoso"]
          },
    
    ];
    // Inserimento dei prodotti nel database prima di ogni test
    before(async () => {
      const response = await Promise.all([
        Product.create(products[0]),
        Product.create(products[1]),
        Product.create(products[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    // Rimozione dei prodotti dal database dopo ogni test
    after(async () => {
      await Promise.all([
        Product.findByIdAndDelete(ids[0]),
        Product.findByIdAndDelete(ids[1]),
        Product.findByIdAndDelete(ids[2]),
      ]);
    });
    // Test per la chiamata GET alla lista di prodotti
    it("test success 200", async () => {
      const { status, body } = await request(app).get(basicUrl);
      status.should.be.equal(200);
      body.should.have.property("length").equal(products.length);
    });
    // Test per la chiamata GET alla lista di prodotti filtrati per marca
    it("test success 200 with query params", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}?brand=apple`
      );
      status.should.be.equal(200);
      body.should.have.property("length").equal(1);
    });
  });
});

/*
          body.should.have.property("_id");
          body.should.have.property("name").equal(product.name);
          body.should.have.property("category").equal(product.category);
          body.should.have.property("subcategory").equal(product.subcategory);
          body.should.have.property("price").equal(product.price);
          body.should.have.property("rank").equal(product.rank);
          body.should.have.property("reviews").equal(product.reviews);
*/