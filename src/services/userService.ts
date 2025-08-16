import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from 'firebase/auth';

export interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Caissier' | 'Gestionnaire de Stock';
}

export interface NewUser extends Omit<UserData, 'id'> {
    password?: string;
}

const usersCollection = collection(db, 'users');

// Get all users
export const getUsers = async (): Promise<UserData[]> => {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
};

// Add a new user (This is more complex because it involves Auth and Firestore)
export const addUser = async (userData: NewUser) => {
    if (!userData.password) {
        throw new Error("Password is required to create a user.");
    }
    // Note: This uses the client SDK. For admin-initiated user creation,
    // a backend function (Firebase Function) is a more robust solution
    // to avoid the current admin being signed out.
    // This is a simplified version for this prototype.
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    // Now add user details to Firestore
    const userDocData = {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
    };
    await addDoc(usersCollection, userDocData);
    
    // We should re-authenticate the admin user afterwards, but that's complex on the client.
    // For now, this is a known limitation of the prototype.
};


// Update a user
export const updateUser = (id: string, data: Partial<Omit<UserData, 'id' | 'email'>>) => {
    const userDoc = doc(db, 'users', id);
    return updateDoc(userDoc, data);
};

// Delete a user
export const deleteUser = async (id: string) => {
    // This is also complex. Deleting from Firestore is easy.
    // Deleting from Firebase Auth from the client is hard and requires the user to be re-authenticated.
    // A server-side Firebase Function is the correct way to handle this.
    // We will only delete from Firestore for this prototype.
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
    
    // A real implementation would need a cloud function to delete the auth user.
    // The code would look like:
    // await deleteAuthUser(user);
};
