
import React, { useState } from 'react';
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
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { toast } from '../../components/toast';

const LoginScreen: React.FC<{
  onShowPrivacy: () => void;
}> = ({ onShowPrivacy }) => {
  const history = useHistory();
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setBusy(true);
      console.log('[DEBUG] Tentativo di accesso con Google...');

      const result = await FirebaseAuthentication.signInWithGoogle();
      console.log('[DEBUG] Accesso con Google riuscito:', JSON.stringify(result, null, 2));

      toast('Login avvenuto con successo!');
      history.push('/home');
    } catch (error: any) {
      console.error('------------------------------------------');
      console.error('[DEBUG] ERRORE COMPLETO DI LOGIN:', error);
      console.error('[DEBUG] Codice Errore:', error.code);
      console.error('[DEBUG] Messaggio Errore:', error.message);
      console.error('------------------------------------------');

      // Analisi dell'errore per l'utente
      let userMessage = 'Si è verificato un errore durante l\'accesso con Google.';
      if (error.message) {
        if (error.message.includes('12501') || error.message.includes('12500')) {
          userMessage = 'Accesso annullato dall\'utente.';
        } else if (error.message.includes('10') || error.message.includes('DEVELOPER_ERROR')) {
           userMessage = 'Errore di configurazione. Controlla la console di Firebase e la chiave SHA-1.';
        } else if (error.message.includes('network')) {
           userMessage = 'Errore di rete. Controlla la tua connessione internet.';
        }
      }
      
      toast(userMessage);
    } finally {
      setBusy(false);
      console.log('[DEBUG] Operazione di login terminata.');
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

        <IonRow className="ion-margin-top">
          <IonCol>
            <IonButton
              expand="block"
              onClick={handleGoogleSignIn}
              disabled={busy}
            >
              Accedi con Google
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol className="ion-text-center">
            <a href="#" onClick={onShowPrivacy}>
              Privacy Policy
            </a>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default LoginScreen;
