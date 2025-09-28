
import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonButton,
  IonLabel,
  IonInput,
  IonItem,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { FirebaseAuthentication, User } from '@capacitor-firebase/authentication';
import { toast } from '../../components/toast';

const LoginScreen: React.FC<{
  onShowPrivacy: () => void;
}> = ({ onShowPrivacy }) => {
  const history = useHistory();
  const [busy, setBusy] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  
  // Stato per il login con Email/Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- SOLUZIONE: Aggiungiamo un listener per lo stato di autenticazione ---
  useEffect(() => {
    const listener = FirebaseAuthentication.addListener('authStateChange', (change: { user: User | null }) => {
      if (change.user) {
        log('[AUTH_LISTENER] Utente autenticato, reindirizzo alla home...');
        toast('Login avvenuto con successo!');
        history.push('/home');
      } 
    });

    // Pulizia del listener quando il componente viene smontato
    return () => {
      listener.remove();
    };
  }, [history]);

  const log = (message: string) => {
    console.log(message);
    setDebugMessages(prev => [message, ...prev]);
  };

  const handleGoogleSignIn = async () => {
    setDebugMessages([]);
    log('Avvio login con Google...');
    setBusy(true);
    try {
      await FirebaseAuthentication.signInWithGoogle();
      // La navigazione ora è gestita dal listener useEffect
    } catch (error: any) {
      log(`ERRORE Google Sign-In: ${error.message || JSON.stringify(error)}`);
      toast(error.message || 'Errore durante il login con Google');
    } finally {
      setBusy(false);
    }
  };

  // --- NUOVO: Funzione per il login con Email e Password ---
  const handleEmailPasswordSignIn = async () => {
    if (!email || !password) {
      toast('Per favore, inserisci email e password.');
      return;
    }
    setDebugMessages([]);
    log('Avvio login con Email/Password...');
    setBusy(true);
    try {
      await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      // La navigazione è gestita dal listener useEffect
    } catch (error: any) {
      log(`ERRORE Email/Pwd: ${error.code} - ${error.message}`);
      let userMessage = 'Errore durante il login.';
      if (error.code) {
        switch(error.code) {
          case "auth/invalid-email":
            userMessage = "L'indirizzo email non è valido.";
            break;
          case "auth/user-disabled":
            userMessage = "Questo utente è stato disabilitato.";
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
            userMessage = "Email o password non corretti.";
            break;
          default:
             userMessage = "Credenziali non valide.";
        }
      }
      toast(userMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <IonLoading message={"Attendere..."} duration={0} isOpen={busy} />
        <IonRow>
          <IonCol className="ion-text-center">
            <h1>Benvenuto!</h1>
            <p>Accedi per continuare</p>
          </IonCol>
        </IonRow>

        {/* --- CAMPI EMAIL/PASSWORD --- */}
        <IonItem className="ion-margin-top">
          <IonLabel position="floating">Email</IonLabel>
          <IonInput type="email" value={email} onIonInput={e => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput type="password" value={password} onIonInput={e => setPassword(e.detail.value!)} />
        </IonItem>

        <IonRow className="ion-margin-top">
          <IonCol>
            <IonButton expand="block" onClick={handleEmailPasswordSignIn} disabled={busy}>
              Accedi con Email e Password
            </IonButton>
          </IonCol>
        </IonRow>

        <IonRow className="ion-margin-top">
          <IonCol className="ion-text-center">
            <p>oppure</p>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonButton
              expand="block"
              onClick={handleGoogleSignIn}
              disabled={busy}
              color="medium" // Colore diverso per distinguerlo
            >
              Accedi con Google
            </IonButton>
          </IonCol>
        </IonRow>

        <IonRow className="ion-margin-top">
          <IonCol className="ion-text-center">
            <a href="#" onClick={onShowPrivacy}>
              Privacy Policy
            </a>
          </IonCol>
        </IonRow>
        
        {debugMessages.length > 0 && (
          <IonCard className="ion-margin-top">
            <IonCardHeader>
              <IonCardTitle>Log di Debug</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
                {debugMessages.join('\n')}
              </pre>
            </IonCardContent>
          </IonCard>
        )}

      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
