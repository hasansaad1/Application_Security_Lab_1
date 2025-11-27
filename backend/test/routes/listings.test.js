const request = require("supertest");
const app = require("../../src/server");
const cookie = require('cookie');

describe("Listings api endpoints: ", () => {
  
  test("POST /listings should create a listing correctly", async () => {
    const validCredentials = { email: 'mark.smith@gmail.com', password: 'Qwerqwer1234!' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);
    const cookieHeader = response.headers['set-cookie'];
    const cookieString = cookieHeader[0];
    const match = cookieString.match(/token=([^;]+)/);
    let authToken = null;
    if (match && match[1]) {
        authToken = match[1];
    }

    const response2 = await request(app).post('/listings').set('Authorization', `Bearer ${authToken}`).send({
        owner_id: response.body.data.user.id,
        title: 'Apartment in Les Corts',
        price: '1000',
        description: 'Modern 4-bedroom apartment near the city center. Very close to the metro L3.',
        address_country: 'Spain',
        address_province: 'Barcelona',
        address_city: 'Barcelona',
        address_zip_code: '08028',
        address_line1: 'Gran Via Carles III, 24',
        address_line2: '3r 1a'
      });

      expect(response2.status).toBe(201);
  });

  test("GET /listings/my should return my listings", async () => {
    const validCredentials = { email: 'mark.smith@gmail.com', password: 'Qwerqwer1234!' };
    const response = await request(app)
            .post('/auth/login')
            .send(validCredentials);
    const cookieHeader = response.headers['set-cookie'];
    const cookieString = cookieHeader[0];
    const match = cookieString.match(/token=([^;]+)/);
    let authToken = null;
    if (match && match[1]) {
        authToken = match[1];
    }
    //console.log(authToken);
    const response2 = await request(app).get('/listings/my').set('Authorization', `Bearer ${authToken}`);;
    //console.log(response2.body);

    let found = false;
    for (const element of response2.body) {
      if(element.title === "Apartment in Les Corts"){
        found=true;
        break;
      }
    }
    expect(found).toEqual(true);
  });

});
