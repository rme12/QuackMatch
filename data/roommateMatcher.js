import { ObjectId } from 'mongodb';
import { connectToDb } from '../config/mongoConnection.js';
import { all } from 'axios';


const getUserById = async (id) => {
    if (!id) throw 'You must provide an id to search for';
    if (typeof id !== 'string') throw 'Id must be a string';
    if (id.trim().length === 0)
        throw 'Id cannot be an empty string or just spaces';
    id = id.trim();
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    const db = await connectToDb();
    const user = db.collection('Users').findOne({_id: new ObjectId(id)});
    if (user === null) throw new Error(`No user with that id ${id}`);
    return user;
};

const getAllUsers = async () => {
    const db = await connectToDb();
    const allUsers = await db.collection('Users').find({}).toArray();
    if (allUsers.length === 0){
        throw new Error("Now users found");
    }
    return allUsers;
}

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number); 
    return hours * 60 + minutes; 
};

const differenceInMinutes = (time1, time2) => {
    const time1Minutes = timeToMinutes(time1);
    const time2Minutes = timeToMinutes(time2);
    return Math.abs(time1Minutes - time2Minutes);
};

const similarityScore = (user1, user2) => {
    let similarity = 0;
    
    const pref1 = user1.preferences;
    const pref2 = user2.preferences;
    if (pref1 === undefined || pref2 === undefined || pref1 === null || pref2 === null) {
        return 0;
    }
    const mostImportantPreferences = pref1.mostImportantPreferences;
    const leastImportantPreferences = pref1.leastImportantPreferences;
    //Compare each preference the users have
    
    for (const attb in pref1){
        let scoreChange = 0;
        
        //If a preference is the same, simularity goes up by 1
        if (pref1[attb] === pref2[attb] && attb !== 'preferredRoommateGender' && attb !== 'introvertExtrovertLevel'){
            scoreChange+=1;
        }

        //Have different rules for each difference depending on the attribute
        else if (attb === 'wakeUpTime' || attb === 'sleepTime'){
            let difference = Math.floor(differenceInMinutes(pref1[attb], pref2[attb])/30); //Make the difference only be significant for every 30 minutes of difference
            difference = 1-(0.1*difference);
            if (difference < 0) {
                difference = 0;
            }
            scoreChange+=difference;
        }
        
        else if (attb === "cleanliness" || attb === "noiseTolerance" || attb === "petTolerance" || attb === "guestPolicy") { 
            const ratingMap = {"Low": 0, "Moderate": 0.5, "High": 1, 
                "No guests": 0, "Only with notice": 0.5, "Open to guests": 1, 
                "None": 0, "Small animals": 0.5, "Any pets": 1};
            scoreChange += 1 - (Math.abs(ratingMap[pref1[attb]] - ratingMap[pref2[attb]]));
        }

        else if (attb === 'smokingVapingAllowed' || attb == 'openToSharedRoom'){
            const difference = pref1[attb] == pref2[attb] ? 0 : 1
            scoreChange += 1 - difference;
        }
        
        else if (attb === 'preferredRoommateGender'){
            if (user1.gender === pref2[attb]) {scoreChange+=0.5;}
            if (user2.gender === pref1[attb]) {scoreChange+=0.5;}
        }

        else if (attb === 'desiredRoommateSocialLevel') {
            const dif1 = 0.5 - (Math.abs(pref1[attb] - pref2['introvertExtrovertLevel']) * 0.15);
            scoreChange += dif1 < 0 ? 0 : dif1;
            const dif2 = 0.5 - (Math.abs(pref2[attb] - pref1['introvertExtrovertLevel']) * 0.15);
            scoreChange += dif2 < 0 ? 0 : dif2;
        }

        else if (attb === 'preferredRoommateAge') {
            const dif1 = 0.5 - (Math.abs(pref1[attb] - user2.age) * 0.15);
            scoreChange += dif1 < 0 ? 0 : dif1;
            const dif2 = 0.5 - (Math.abs(pref2[attb] - user1.age) * 0.15);
            scoreChange += dif2 < 0 ? 0 : dif2;
        }

        else if (attb === 'temperaturePreference') {
            const diff = Math.floor(Math.abs(pref1[attb] - pref2[attb]) / 2);
            scoreChange += 1 - (diff * 0.1);
        }
        //If attribute is most important then its influence is increased
        if (mostImportantPreferences.includes(attb)){
            scoreChange = scoreChange*2.5;
        }

        //If attribute is least important then its influence is decreased
        if (leastImportantPreferences === attb){
            scoreChange = scoreChange/2;
        }
        similarity+=scoreChange;
    }
    
    
    
    return similarity/12;
}

const updateMatches = async (userId, matchedUsers) => {
    if (!userId) throw 'You must provide a userId';
    if (typeof userId !== 'string' || userId.trim().length === 0) throw 'Invalid userId';
    if (!ObjectId.isValid(userId)) throw 'Invalid ObjectId';

    const db = await connectToDb();
    const result = await db.collection('Users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { matchedUsers } }
    );
    if (result.modifiedCount === 0) {
        return {success: false, message: 'Matches failed to update'};
    }
    return { success: true, message: 'Matches updated successfully.' };
};

export async function findMatches(userId, sessionData) {

    //Get all users as well as the user you want to match with
    // Get all users as well as the user you want to match with
    const user = await getUserById(userId);
    const allUsers = await getAllUsers();

    let top10 = [];

    // Loop through each user and generate a similarity score
    for (const otherUser of allUsers) {
        if (otherUser._id.toString() === user._id.toString()){
            continue;
        }
        const similarity = similarityScore(user, otherUser);

        // Add the current user and their score as a tuple
        top10.push([otherUser, similarity]);

        // Sort the list in descending order of similarity scores
        top10.sort((a, b) => b[1] - a[1]);

        // If the list exceeds 10, remove the lowest scorer
        if (top10.length > 10) {
            top10.pop();
        }
    }

    // Return the list of the top 10 highest scorers
    return top10;
}

export async function findAndUpdateMatches(userId){
    if (typeof userId !== "string"){
        userId = userId.toString();
    }
    const matches = await findMatches(userId);
    const updateResult = await updateMatches(userId, matches);
    return [matches, updateResult];
}