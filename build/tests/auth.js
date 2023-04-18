"use strict";
/*
import request from "supertest";
require("chai").should();
import bcrypt from "bcrypt";
import { app } from "../app";
import { v4 } from "uuid";
import { User as UserSchema } from "../models/User";
import { assert } from "chai";
import { saltRounds } from "../routes/auth";

const baseAuth = "/v1/auth";
// Test relativi all'autenticazione dell'utente
describe("auth", () => {
  // Definizione delle informazioni dell'utente
  const user = {
    name: "Alberto",
    surname: "Ferrari",
    email: "albertoferrari78@gmail.com",
    password: "12345678",
  };
  // Test per la registrazione di un nuovo utente
  describe("signup", () => {
    // Dopo ogni test, elimina l'utente creato dal database
    after(async () => {
      await UserSchema.findOneAndDelete({ email: user.email });
    });
    // Test che verifica la validità di un'email errata
    it("test 400 wrong email", async () => {
      const { status } = await request(app)
        .post(`${baseAuth}/signup`)
        .send({ ...user, email: "wrong-email" });
      status.should.be.equal(400);
    });
    // Test che verifica la presenza del campo nome nella richiesta
    it("test 400 missing name", async () => {
      const userWithoutName = { ...user } as any;
      delete userWithoutName.name;
      const { status } = await request(app)
        .post(`${baseAuth}/signup`)
        .send(userWithoutName);
      status.should.be.equal(400);
    });
    // Test che verifica la validità di una password troppo corta
    it("test 400 short password", async () => {
      const userWithShortPassword = { ...user } as any;
      userWithShortPassword.password = "aaa";
      const { status } = await request(app)
        .post(`${baseAuth}/signup`)
        .send(userWithShortPassword);
      status.should.be.equal(400);
    });
    // Test che verifica la corretta creazione di un utente
    it("test 201 for signup", async () => {
      const { body, status } = await request(app)
        .post(`${baseAuth}/signup`)
        .send(user);
      status.should.be.equal(201);
      body.should.have.property("id");
      body.should.have.property("name").equal(user.name);
      body.should.have.property("surname").equal(user.surname);
      body.should.have.property("email").equal(user.email);
      body.should.not.have.property("password");
      body.should.not.have.property("verify");
    });
    // Test che verifica la presenza di un'email già registrata
    it("test 409 email is just present", async () => {
      const { status } = await request(app)
        .post(`${baseAuth}/signup`)
        .send(user);
      status.should.be.equal(409);
    });
  });
  // Test per la validazione dell'account tramite email
  describe("validate", async () => {
    const verify = v4(); // Genera un ID casuale per la proprietà 'verify' dell'utente
    // Prima di ogni test, crea un utente con una proprietà 'verify' casuale
    before(async () => {
      const userCreated = new UserSchema({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: user.password,
        verify,
      });
      await userCreated.save();
    });
    // Dopo ogni test, rimuovi l'utente appena creato
    after(async () => {
      await UserSchema.findOneAndDelete({ email: user.email });
    });
    // Testa il caso in cui il token fornito è invalido
    it("test 400 Invalid token", async () => {
      const { status } = await request(app).get(
        `${baseAuth}/validate/fake-token`
      );
      status.should.be.equal(400);
    });
    // Testa il caso in cui il token fornito è valido
    it("test 200 set token", async () => {
      const { status } = await request(app).get(
        `${baseAuth}/validate/${verify}`
      );
      status.should.be.equal(200);
      // Verifica che la proprietà 'verify' dell'utente sia stata rimossa
      const userFinded = await UserSchema.findOne({ email: user.email });
      assert.equal(userFinded!.verify, undefined);
    });
  });

  describe("login", () => {
    // Prima di ogni test, crea un utente e lo salva nel database
    before(async () => {
      const userCreated = new UserSchema({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: await bcrypt.hash(user.password, saltRounds), // Hash della password
      });
      await userCreated.save(); // Salva l'utente nel database
    });
    // Dopo ogni test, rimuovi l'utente creato dal database
    after(async () => {
      await UserSchema.findOneAndDelete({ email: user.email }); // Trova e rimuovi l'utente
    });
    // Test 1: Verifica che la richiesta con dati errati restituisca uno stato 400 (Bad Request)
    it("test 400 wrong data", async () => {
      const { status } = await request(app)
        .post(`${baseAuth}/login`)
        .send({ email: "wrongmail", password: "A simple password" });
      status.should.be.equal(400); // Verifica che lo stato HTTP sia 400
    });
    // Test 2: Verifica che la richiesta con credenziali errate restituisca uno stato 401 (Unauthorized)
    it("test 401 invalid credentials", async () => {
      const { status } = await request(app)
        .post(`${baseAuth}/login`)
        .send({ email: user.email, password: "wrong-password" });
      status.should.be.equal(401); // Verifica che lo stato HTTP sia 401
    });
    // Test 3: Verifica che la richiesta con credenziali corrette restituisca uno stato 200 (OK) e un token
    it("test 200 login success", async () => {
      const { status, body } = await request(app)
        .post(`${baseAuth}/login`)
        .send({ email: user.email, password: user.password });
      status.should.be.equal(200); // Verifica che lo stato HTTP sia 200
      body.should.have.property("token"); // Verifica che nel corpo della risposta sia presente un token
    });
  });

  describe("login with not confirmed user", () => {
    // Creazione di un utente non confermato prima di ogni test
    before(async () => {
      const userCreated = new UserSchema({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: await bcrypt.hash(user.password, saltRounds),
        verify: v4(),
      });
      await userCreated.save();
    });
    // Rimozione dell'utente non confermato dopo ogni test
    after(async () => {
      await UserSchema.findOneAndDelete({ email: user.email });
    });
    // Test del login con l'utente non ancora confermato
    it("test 401 login not success (while email is not verified)", async () => {
      const { status } = await request(app)
        .post(`${baseAuth}/login`)
        .send({ email: user.email, password: user.password });
      status.should.be.equal(401); // L'operazione di login dovrebbe restituire il codice di stato 401
    });
  });

  describe("me", () => {
    before(async () => {
      // Crea un utente prima di ogni test
      const userCreated = new UserSchema({
        name: user.name,
        surname: user.surname,
        email: user.email,
        password: await bcrypt.hash(user.password, saltRounds),
      });
      await userCreated.save();
    });
    after(async () => {
      // Dopo ogni test, rimuovi l'utente creato
      await UserSchema.findOneAndDelete({ email: user.email });
    });
    it("test 200 token wrong", async () => {
      // Effettua una richiesta con un token errato
      const { status } = await request(app)
        .get(`${baseAuth}/me`)
        .set({ authorization: "wrong-token" });
      status.should.be.equal(400);
    });
    it("test 200 token rigth", async () => {
      // Effettua il login per ottenere un token valido
      const {
        body: { token },
      } = await request(app)
        .post(`${baseAuth}/login`)
        .send({ email: user.email, password: user.password });
      // Effettua una richiesta con il token valido
      const { body } = await request(app)
        .get(`${baseAuth}/me`)
        .set({ authorization: token });
      // Verifica che la risposta contenga le informazioni corrette sull'utente
      body.should.have.property("id");
      body.should.have.property("name").equal(user.name);
      body.should.have.property("surname").equal(user.surname);
      body.should.have.property("email").equal(user.email);
      assert.equal(body!.verify, undefined);
      assert.equal(body!.password, undefined);
    });
  });
});
*/ 
