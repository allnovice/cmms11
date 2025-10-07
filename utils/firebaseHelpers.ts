import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

// Create or update user profile in Firestore
export async function createOrUpdateUserProfile({
  uid,
  email,
  role = "Employee",
  division = "",
  employeeId = "",
}: {
  uid: string;
  email: string | null;
  role?: string;
  division?: string;
  employeeId?: string;
}) {
  if (!email) return;

  const username = email.split("@")[0]; // first part of email
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      username,
      role,
      division,
      employeeId,
      createdAt: new Date().toISOString(),
    });
  }
}
