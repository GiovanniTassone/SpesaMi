import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [prodotto, setProdotto] = useState("");
  const [prezzo, setPrezzo] = useState("");
  const [lista, setLista] = useState([]);
  const [prezziTemporanei, setPrezziTemporanei] = useState({});
  const [editMode, setEditMode] = useState({});
  const [utente, setUtente] = useState(null); // Sessione in background

  useEffect(() => {
    const utenteSalvato = sessionStorage.getItem("utente");
    if (utenteSalvato) {
      setUtente(JSON.parse(utenteSalvato));
    } else {
      const nuovoUtente = { nome: "Utente" };
      sessionStorage.setItem("utente", JSON.stringify(nuovoUtente));
      setUtente(nuovoUtente);
    }
  }, []);

  const aggiungiProdotto = () => {
    if (prodotto) {
      const nuovoProdotto = {
        nome: prodotto,
        prezzo: prezzo ? parseFloat(prezzo) : null,
        quantità: 1,
      };
      setLista([...lista, nuovoProdotto]);
      setProdotto("");
      setPrezzo("");
    }
  };

  const handleInputChange = (index, value) => {
    setPrezziTemporanei({
      ...prezziTemporanei,
      [index]: value,
    });
  };

  const salvaPrezzo = (index) => {
    const nuovoPrezzo = parseFloat(prezziTemporanei[index]);
    if (!isNaN(nuovoPrezzo)) {
      const nuovaLista = [...lista];
      nuovaLista[index].prezzo = nuovoPrezzo;
      setLista(nuovaLista);

      const copiaPrezzi = { ...prezziTemporanei };
      delete copiaPrezzi[index];
      setPrezziTemporanei(copiaPrezzi);

      setEditMode({
        ...editMode,
        [index]: false,
      });
    }
  };

  const cambiaQuantita = (index, delta) => {
    const nuovaLista = [...lista];
    nuovaLista[index].quantità += delta;
    if (nuovaLista[index].quantità < 1) nuovaLista[index].quantità = 1;
    setLista(nuovaLista);
  };

  const rimuoviProdotto = (index) => {
    const nuovaLista = lista.filter((_, i) => i !== index);
    setLista(nuovaLista);
  };

  const attivaModificaPrezzo = (index) => {
    setEditMode({
      ...editMode,
      [index]: true,
    });
    setPrezziTemporanei({
      ...prezziTemporanei,
      [index]: lista[index].prezzo,
    });
  };

  const cancellaTuttiProdotti = () => {
    setLista([]);
  };

  const totale = lista.reduce((acc, item) => acc + (item.prezzo || 0) * (item.quantità || 1), 0);

  return (
    <div className="container-fluid py-4 px-3">
      <div style={{ backgroundColor: "white", width: "47vw", margin: "0 auto", borderRadius: "10em" }} className="mb-4 d-flex justify-content-center align-items-center">
        <img style={{ width: "14vw", height: "14vw" }} src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" className="img-fluid rounded-top" alt="" />
        <h1 className="text-center">
          <b>SpesaMi</b>
        </h1>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-5">
          <input type="text" className="form-control" placeholder="Nome prodotto" value={prodotto} onChange={(e) => setProdotto(e.target.value)} />
        </div>
        <div className="col-12 col-md-4">
          <input type="number" className="form-control" placeholder="Prezzo (opzionale)" value={prezzo} onChange={(e) => setPrezzo(e.target.value)} />
        </div>
        <div className="col-12 col-md-3">
          <button className="btn btn-primary w-100" onClick={aggiungiProdotto}>
            ➕ Aggiungi
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>Prodotto</th>
              <th>Prezzo</th>
              <th>Quantità</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((item, index) => (
              <tr key={index}>
                <td className="text-break">{item.nome}</td>
                <td>
                  {item.prezzo === null || editMode[index] ? (
                    <div className="d-flex flex-column gap-2">
                      <input type="number" className="form-control" value={prezziTemporanei[index] || ""} onChange={(e) => handleInputChange(index, e.target.value)} />
                      <button className="btn btn-success btn-sm" onClick={() => salvaPrezzo(index)}>
                        💾 Salva
                      </button>
                    </div>
                  ) : (
                    <>€{item.prezzo.toFixed(2)}</>
                  )}
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => cambiaQuantita(index, -1)}>
                      -
                    </button>
                    <span className="px-2">{item.quantità}</span>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => cambiaQuantita(index, 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
                    {item.prezzo !== null && !editMode[index] && (
                      <button className="btn btn-warning btn-sm" onClick={() => attivaModificaPrezzo(index)}>
                        ✏️ Modifica Prezzo
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => rimuoviProdotto(index)}>
                      🗑️ Rimuovi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <strong>Totale</strong>
              </td>
              <td colSpan="3">
                <strong>€{totale.toFixed(2)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 p-3 border rounded bg-light text-center">
        <h5>💳 Buoni Pasto</h5>
        <p>
          Puoi usare <strong>{Math.floor(totale / 7.6)}</strong> buono/i pasto da 7,60€.
        </p>
        <p>
          Differenza da pagare: <strong>€{(totale - Math.floor(totale / 7.6) * 7.6).toFixed(2)}</strong>
        </p>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={cancellaTuttiProdotti}>
          🗑️ Cancella Tutti i Prodotti
        </button>
      </div>
    </div>
  );
}

export default App;
