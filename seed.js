import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'QuackMatchDB';
const USERS_COLLECTION = 'Users';
const LISTINGS_COLLECTION = 'ApartmentDorms';

const cleanlinessOptions = ['Low', 'Moderate', 'High'];
const guestPolicyOptions = ['No guests', 'Only with notice', 'Open to guests'];
const noiseOptions = ['Low', 'Moderate', 'High'];
const petOptions = ['No pets', 'Only cats', 'Only dogs', 'Any pets'];
const genderOptions = ['Male', 'Female', 'Non-binary'];
const preferenceKeys = [
    'wakeUpTime', 'sleepTime', 'cleanliness', 'guestPolicy',
    'noiseTolerance', 'smokingVapingAllowed', 'petTolerance',
    'openToSharedRoom', 'temperaturePreference', 'introvertExtrovertLevel',
    'desiredRoommateSocialLevel', 'preferredRoommateAge', 'preferredRoommateGender'
];

const housingImages = [
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
    'https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg'
];


const generateRandomUser = async () => {
    const password = await bcrypt.hash('Password123!', 10);
    const mostImportant = faker.helpers.shuffle(preferenceKeys).slice(0, 6);
    const leastImportant = faker.helpers.arrayElement(preferenceKeys);

    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email({ provider: 'stevens.edu' }),
        hashedPassword: password,
        matchedUsers: [],
        chatHistoryIds: [],
        preferences: {
            wakeUpTime: faker.date.recent().toTimeString().slice(0, 5),
            sleepTime: faker.date.recent().toTimeString().slice(0, 5),
            cleanliness: faker.helpers.arrayElement(cleanlinessOptions),
            guestPolicy: faker.helpers.arrayElement(guestPolicyOptions),
            noiseTolerance: faker.helpers.arrayElement(noiseOptions),
            smokingVapingAllowed: faker.datatype.boolean(),
            petTolerance: faker.helpers.arrayElement(petOptions),
            openToSharedRoom: faker.datatype.boolean(),
            temperaturePreference: faker.number.int({ min: 50, max: 80 }),
            introvertExtrovertLevel: faker.number.int({ min: 1, max: 10 }),
            desiredRoommateSocialLevel: faker.number.int({ min: 1, max: 10 }),
            preferredRoommateAge: faker.number.int({ min: 18, max: 35 }),
            preferredRoommateGender: faker.helpers.arrayElement(genderOptions),
            mostImportantPreferences: mostImportant,
            leastImportantPreferences: leastImportant,
        },
        age: faker.number.int({ min: 18, max: 30 }),
        gender: faker.helpers.arrayElement(genderOptions),
        studentID: `id${faker.string.alphanumeric(6)}`,
        profilePicPath: `public/uploads/${faker.string.alphanumeric(32)}.jpg`
    };
};

const generateRandomListing = () => {
    const onCampus = faker.datatype.boolean();
    return {
    address: `${faker.number.int({ min: 1, max: 500 })} ${faker.location.street()} Apt. ${faker.number.int({ min: 1, max: 20 })}`,
    status: onCampus ? 'On-Campus' : 'Off-Campus',
    cost: faker.number.int({ min: 4000, max: 10000 }),
    amenities: faker.helpers.arrayElements(
        ['Washer/Dryer', 'Wifi', 'Furnished', 'Heat/Cooling', 'Parking', 'Gym'],
        { min: 2, max: 4 }
    ),
    numberOfRooms: faker.number.int({ min: 1, max: 5 }),
    landlordName: onCampus ? 'Stevens Housing' : faker.person.fullName(),
    landlordContactInfo: faker.internet.email({ provider: 'stevens.edu' }),
    imageUrl: faker.helpers.arrayElement(housingImages),
};
};

const seedDatabase = async () => {
const client = new MongoClient(MONGO_URI);
try {
await client.connect();
console.log('Connected to MongoDB');
const db = client.db(DB_NAME);

const users = await Promise.all(Array.from({ length: 100 }, () => generateRandomUser()));
const listings = Array.from({ length: 50 }, () => generateRandomListing());

//await db.collection(USERS_COLLECTION).deleteMany({});
//await db.collection(LISTINGS_COLLECTION).deleteMany({});

await db.collection(USERS_COLLECTION).insertMany(users);
await db.collection(LISTINGS_COLLECTION).insertMany(listings);

console.log('Seeded 100 users and 30 apartment/dorm listings');
} catch (err) {
console.error('Error seeding data:', err);
} finally {
await client.close();
}
};

seedDatabase();