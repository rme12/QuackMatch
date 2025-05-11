
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'QuackMatchDB';
const COLLECTION_NAME = 'Users';

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

const generateRandomUser = async () => {
    const password = await bcrypt.hash('Password123!', 10);
    const mostImportant = faker.helpers.shuffle(preferenceKeys).slice(0, 6);
    const leastImportant = faker.helpers.arrayElement(preferenceKeys);

    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(undefined, undefined, 'stevens.edu'),
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

const seedUsers = async () => {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const users = await Promise.all(Array.from({ length: 100 }, generateRandomUser));
        await usersCollection.insertMany(users);

        console.log('Successfully seeded 100 users');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        await client.close();
    }
};

seedUsers();
