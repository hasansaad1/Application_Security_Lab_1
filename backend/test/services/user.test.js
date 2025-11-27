const request = require('supertest');
const userService = require("../../src/services/user");
const bcrypt = require('bcrypt');

describe("User services tests: ", () => {

test('Creates a user correctly', async () => {
    let username = "Mark";
    let email = "mark.smith@gmail.com";
    let password = "Qwerqwer1234!";
    let phone_number = "664544035";
    let profile_picture_path = "/fake/relative/path";
                
    /* Hash password */
    const password_hash = await bcrypt.hash(password, 10);
    
    /* Create user */
    const user = await userService.createUser({
        username,
        email,
        password_hash,
        profile_picture_path,
        phone_number
    });

    expect(user.username).toEqual("Mark");
    expect(user.email).toEqual("mark.smith@gmail.com");
    expect(user.password_hash).toEqual(password_hash);
    expect(user.phone_number).toEqual("664544035");
    expect(user.profile_picture_path).toEqual("/fake/relative/path");
});

test('Gets user by email correctly', async () => {
    let email = "mark.smith@gmail.com";
    
    /*Get user by email*/
    const user = await userService.getUserByEmail(email);

    expect(user.username).toEqual("Mark");
    expect(user.email).toEqual("mark.smith@gmail.com");
    //TODO: This comparison is not working
    //let validCredentials = await bcrypt.compare(await bcrypt.hash("Qwerqwer1234!", 10), user.password_hash);
    //expect(validCredentials).toBe(true);
    expect(user.phone_number).toEqual("664544035");
    expect(user.profile_picture_path).toEqual("/fake/relative/path");
});

test('Gets all users', async () => {
    /* Get all users*/
    const users = await userService.getUsers();
    expect(users.length).toBe(5);
    // Also maybe test that the 5 users are the ones that you expected?:
    //'admin_john'
    //'landlord_maria'
    //'tenant_bob'
    //'tenant_alice'
    //'Mark'
});

});