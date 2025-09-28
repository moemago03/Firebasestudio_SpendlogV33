
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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- SOLUZIONE con DOPPIA SICURA: Controlla utente corrente E ascolta cambiamenti ---
  useEffect(() => {
    const log = (message: string) => {
        console.log(message);
        // Non aggiorniamo più lo stato di debug qui per evitare loop
    };

    // 1. CONTROLLO ATTIVO: Appena il componente si monta, controlliamo se c'è già un utente.
    const checkCurrentUser = async () => {
      try {
        const result = await FirebaseAuthentication.getCurrentUser();
        if (result.user) {
          log(`[CHECK] Utente ${result.user.uid} già loggato. Reindirizzo...`);
          history.push('/home');
        }
      } catch (error) {
        log('[CHECK] Nessun utente loggato all\'avvio. Normale.');
      }
    };

    checkCurrentUser();

    // 2. ASCOLTO PASSIVO: Restiamo in ascolto per futuri cambi di stato (login effettuato mentre siamo sulla pagina)
    const listener = FirebaseAuthentication.addListener('authStateChange', (change: { user: User | null }) => {
      if (change.user) {
        log(`[LISTENER] Cambio di stato, utente ${change.user.uid} rilevato. Reindirizzo...`);
        history.push('/home');
      } 
    });

    // Pulizia del listener quando il componente viene smontato
    return () => {
      listener.remove();
    };
  }, [history]);

  const logAndDebug = (message: string) => {
    console.log(message);
    setDebugMessages(prev => [message, ...prev]);
  };

  const handleGoogleSignIn = async () => {
    setDebugMessages([]);
    logAndDebug('Avvio login con Google...');
    setBusy(true);
    try {
      await FirebaseAuthentication.signInWithGoogle();
      // La navigazione è gestita dal listener useEffect
    } catch (error: any) {
      logAndDebug(`ERRORE Google Sign-In: ${error.message || JSON.stringify(error)}`);
      toast(error.message || 'Errore durante il login con Google');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailPasswordSignIn = async () => {
    if (!email || !password) {
      toast('Per favore, inserisci email e password.');
      return;
    }
    setDebugMessages([]);
    logAndDebug('Avvio login con Email/Password...');
    setBusy(true);
    try {
      await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      // La navigazione è gestita dal listener useEffect
    } catch (error: any) {
      logAndDebug(`ERRORE Email/Pwd: ${error.code} - ${error.message}`);
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
              color="medium"
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
