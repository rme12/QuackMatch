// helpers/onboarding.js
import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/mongoConnection.js';

export const onboardingQuestions = [
    { field: 'studentID', text: 'What is your Student ID?', type: 'text' },
    { field: 'age', text: 'What is your age?', type: 'number' },
    { field: 'gender', text: 'What is your gender?', type: 'select', options: ['Male', 'Female', 'Non-Binary', 'Other'] },
    { field: 'wakeUpTime', text: 'What time do you usually wake up?', type: 'time' },
    { field: 'sleepTime', text: 'What time do you usually sleep?', type: 'time' },
    { field: 'cleanliness', text: 'How clean are you usually?', type: 'select', options: ['Low', 'Moderate', 'High'] },
    { field: 'guestPolicy', text: 'What is your guest policy?', type: 'select', options: ['No guests', 'Only with notice', 'Open to guests'] },
    { field: 'noiseTolerance', text: 'What is your noise tolerance?', type: 'select', options: ['Low', 'Moderate', 'High'] },
    { field: 'smokingVapingAllowed', text: 'Are you okay with smoking or vaping?', type: 'boolean' },
    { field: 'petTolerance', text: 'What pets are you okay with?', type: 'select', options: ['None', 'Small animals', 'Any pets'] },
    { field: 'openToSharedRoom', text: 'Are you open to sharing a room?', type: 'boolean' },
    { field: 'temperaturePreference', text: 'Preferred room temperature (°F)?', type: 'number' },
    { field: 'introvertExtrovertLevel', text: 'How social are you? (1 = introvert, 10 = extrovert)', type: 'range', min: 1, max: 10 },
    { field: 'desiredRoommateSocialLevel', text: 'Preferred roommate social level (1–10)?', type: 'range', min: 1, max: 10 },
    { field: 'preferredRoommateAge', text: 'Preferred roommate age?', type: 'number' },
    { field: 'preferredRoommateGender', text: 'Preferred roommate gender?', type: 'select', options: ['Male', 'Female', 'Any'] },
    { field: 'mostImportantPreferences', text: 'Which 2 preferences matter the most to you?', type: 'multi-select', options: ['wakeUpTime', 'sleepTime', 'noiseTolerance', 'cleanliness', 'temperaturePreference', 'guestPolicy'] },
    { field: 'leastImportantPreferences', text: 'Which preference matters the least to you?', type: 'select', options: ['none', 'wakeUpTime', 'sleepTime', 'noiseTolerance', 'cleanliness', 'temperaturePreference', 'guestPolicy'] },
    { field: 'profileImage', text: 'Upload a profile picture', type: 'image'}
];

// Format session data into DB schema and save
export async function saveUserOnboardingData(userId, sessionData) {
    const db = await connectToDb();

    await db.collection('Users').updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                studentID: sessionData.studentID,
                age: Number(sessionData.age),
                gender: sessionData.gender,
                profileImage: sessionData.profileImage,
                preferences: {
                    wakeUpTime: sessionData.wakeUpTime,
                    sleepTime: sessionData.sleepTime,
                    cleanliness: sessionData.cleanliness,
                    guestPolicy: sessionData.guestPolicy,
                    noiseTolerance: sessionData.noiseTolerance,
                    smokingVapingAllowed: sessionData.smokingVapingAllowed === 'true',
                    petTolerance: sessionData.petTolerance,
                    openToSharedRoom: sessionData.openToSharedRoom === 'true',
                    temperaturePreference: Number(sessionData.temperaturePreference),
                    introvertExtrovertLevel: Number(sessionData.introvertExtrovertLevel),
                    desiredRoommateSocialLevel: Number(sessionData.desiredRoommateSocialLevel),
                    preferredRoommateAge: Number(sessionData.preferredRoommateAge),
                    preferredRoommateGender: sessionData.preferredRoommateGender,
                    mostImportantPreferences: Array.isArray(sessionData.mostImportantPreferences)
                    ? sessionData.mostImportantPreferences
                    : [sessionData.mostImportantPreferences],
                    leastImportantPreferences: sessionData.leastImportantPreferences
                }
            }
        }
    );
}

