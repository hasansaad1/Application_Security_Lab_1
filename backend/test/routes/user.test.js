const request = require("supertest");
const app = require("../../src/server");

  test("GET /users should return the 4(+1, Mark) initial mock users", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(5);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("username");
    expect(res.body[0]).toHaveProperty("email");
    expect(res.body[0]).toHaveProperty("phone_number");
    expect(res.body[0]).toHaveProperty("profile_picture_path");
  });

  test("GET /:email", async () => {
    const res = await request(app).get("/users/mark.smith@gmail.com");

    expect(res.status).toBe(200);
    expect(res.body.username).toEqual("Mark");
  });

