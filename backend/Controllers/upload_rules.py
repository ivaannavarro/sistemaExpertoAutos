import firebase_admin
from firebase_admin import credentials, firestore
from app import REGLAS  # Importa tus reglas locales

# Verifica si la app ya está inicializada
if not firebase_admin._apps:
    cred = credentials.Certificate("../serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def upload_rules():
    batch = db.batch()
    rules_ref = db.collection('reglas')
    
    # Elimina documentos existentes (opcional)
    docs = rules_ref.stream()
    for doc in docs:
        batch.delete(doc.reference)
    
    # Sube nuevas reglas
    for i, rule in enumerate(REGLAS):
        new_doc = rules_ref.document(f"rule_{i}")
        batch.set(new_doc, rule)
    
    batch.commit()
    print(f"✅ {len(REGLAS)} reglas subidas a Firestore")

if __name__ == "__main__":
    upload_rules()