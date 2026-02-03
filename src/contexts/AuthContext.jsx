
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Map Firebase user to a structure similar to what the app expects
            if (currentUser) {
                sessionStorage.setItem('uid', currentUser.uid);
                const localAvatar = localStorage.getItem(`printlog_avatar_${currentUser.uid}`);
                setUser({
                    id: currentUser.uid,
                    email: currentUser.email,
                    firstName: currentUser.displayName?.split(" ")[0] || "Maker",
                    fullName: currentUser.displayName,
                    imageUrl: localAvatar || currentUser.photoURL,
                    primaryEmailAddress: { emailAddress: currentUser.email },
                    username: currentUser.displayName,
                    publicMetadata: { role: "user" },
                    createdAt: currentUser.metadata.creationTime,
                    passwordEnabled: currentUser.providerData.some(p => p.providerId === 'password'),
                    providerData: currentUser.providerData // Expose full provider data for specific checks (Google vs Email)
                });
            } else {
                sessionStorage.removeItem('uid');
                setUser(null);
            }
            setIsLoaded(true);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
            await updateProfile(userCredential.user, {
                displayName: name
            });
            setUser(prev => ({ ...prev, firstName: name, fullName: name, username: name }));
        }
        return userCredential;
    };

    const signOut = () => {
        return firebaseSignOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    };

    const getToken = async () => {
        if (auth.currentUser) {
            return auth.currentUser.getIdToken();
        }
        return null;
    };

    const updateUserData = async (data) => {
        if (auth.currentUser) {
            // 1. Atualiza Estado Local IMEDIATAMENTE (Feedback UI Instantâneo)
            setUser(prev => ({ ...prev, ...data, imageUrl: data.photoURL || prev?.imageUrl }));

            // 2. Tenta atualizar no Firebase (apenas se for dados seguros/cloud)
            // Se for Base64 (data:image...), não enviamos para o Firebase Auth pois excede o limite.
            const isBase64 = data.photoURL && data.photoURL.startsWith('data:image');

            if (!isBase64) {
                try {
                    await updateProfile(auth.currentUser, data);
                } catch (error) {
                    console.warn("Aviso: Falha ao atualizar perfil remoto (pode ser ignorado se for apenas local):", error);
                    // Não revertemos o estado local pois queremos manter a "ilusão" de sucesso para o usuário em modo offline/local
                }
            }
        }
    };

    const value = {
        user,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        getToken,
        updateUserData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to mimic Clerk's useAuth
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return {
        isLoaded: context.isLoaded,
        isSignedIn: context.isSignedIn,
        userId: context.user?.id,
        sessionId: context.user?.id,
        getToken: context.getToken,
        signOut: context.signOut,
        signIn: context.signIn,
        signUp: context.signUp,
        resetPassword: context.resetPassword,
        signInWithGoogle: context.signInWithGoogle,
        updateUserData: context.updateUserData
    };
}

// Hook to mimic Clerk's useUser
export function useUser() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useUser must be used within an AuthProvider");
    }
    return {
        isLoaded: context.isLoaded,
        isSignedIn: context.isSignedIn,
        user: context.user
    };
}

// Hook to access full context/actions
export function useSession() {
    const context = useContext(AuthContext);
    return context;
}
