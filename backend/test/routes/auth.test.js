const request = require("supertest");
const app = require("../../src/server");

  test("POST /login trying a successful login", async () => {
    
    const validCredentials = { email: 'mark.smith@gmail.com', password: 'Qwerqwer1234!' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);
    
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.body.data.user.username).toEqual("Mark");
  });

  test("POST /login trying a unsuccessful login", async () => {
    
    const invalidCredentials = { email: 'mark.smith@gmail.com', password: 'Qwerqwer5678!' };
    const response = await request(app)
            .post('/auth/login')
            .send(invalidCredentials);
    
    expect(response.status).toBe(401);
    expect(response.body.error).toEqual("Invalid credentials");
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  test("POST /logout trying a successful logout", async () => {
    
    const validCredentials = { email: 'mark.smith@gmail.com', password: 'Qwerqwer1234!' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);

    const response2 = await request(app)
            .post('/auth/logout');
    
    expect(response2.status).toBe(200);
    const cookieHeader = response2.headers['set-cookie'];
    expect(cookieHeader).toBeDefined();

    const cookieString = cookieHeader[0];
    const match = cookieString.match(/token=([^;]+)/);
    let authToken = null;
    if (match && match[1]) {
        authToken = match[1];
    }
    expect(authToken).toBeNull();
  });
