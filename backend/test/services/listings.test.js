const request = require('supertest');
const listingsService = require("../../src/services/listings");
const bcrypt = require('bcrypt');

describe("Listings services tests: ", () => {

test('Creates, updates and deletes a listing correctly', async () => {
    const listingData = {
        owner_id: '1',
        title: 'Cozy Apartment in City Center',
        description: 'A charming 1-bedroom apartment close to all amenities.',
        price: 1200,
        address_country: 'USA',
        address_province: 'NY',
        address_city: 'New York',
        address_zip_code: '10001',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        is_available: true
    };

    const insertId = await listingsService.createListing(listingData);
    
    const updates = {};
    updates.price = 1500;
    await listingsService.updateListing(insertId, updates);

    const updatedListing = await listingsService.getListingById(insertId);
    
    expect(parseFloat(updatedListing.price)).toBe(1500.00);

    await listingsService.deleteListing(insertId);

    let deletedListing = false;
    
    try{
        await listingsService.getListingById(insertId);
    }catch(error){
        deletedListing = true;
    }

    expect(deletedListing).toBe(true);

});

test('Adds and removes a listing to favourites correctly', async () => {
    const listingData = {
        owner_id: '1',
        title: 'Cozy Apartment in City Center',
        description: 'A charming 1-bedroom apartment close to all amenities.',
        price: 1200,
        address_country: 'USA',
        address_province: 'NY',
        address_city: 'New York',
        address_zip_code: '10001',
        address_line1: '123 Main St',
        address_line2: 'Apt 4B',
        is_available: true
    };

    const insertId = await listingsService.createListing(listingData);
    
    await listingsService.addToFavorites(1,insertId);

    expect(await listingsService.isListingFavorited(1,insertId)).toBe(true);

    await listingsService.removeFromFavorites(1,insertId);

    expect(await listingsService.isListingFavorited(1,insertId)).toBe(false);

});

});