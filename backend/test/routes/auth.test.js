const request = require("supertest");
const app = require("../../src/server");

  test("POST /login trying a successful login", async () => {
    
    const validCredentials = { email: 'mark.smith@gmail.com', password: '1234' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);
    
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.body.data.user.username).toEqual("Mark");
  });

  test("POST /login trying a unsuccessful login", async () => {
    
    const validCredentials = { email: 'mark.smith@gmail.com', password: '5678' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);
    
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Invalid credentials");
    expect(response.headers['set-cookie']).toBeUndefined();
  });

