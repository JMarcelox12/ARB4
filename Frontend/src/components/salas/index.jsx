import api from "@/services/api";
import styles from "./roomCard.css";
import { Router } from "express";

const router = Router()

export default function RoomCard({ room }) {
    const irParaSala = (id) => {
        api
        .delete("/ant/:id")
        .then((res) => {
            alert("Formiga excluída com sucesso!");
            router.reload();
        })
        .catch((err) => alert("Erro ao excluir formiga"));
    };

    return (
        <div class="card" style="width: 18rem;">
            <button type="button" onClick={() => irParaSala(room.id)}>
                <img src="..." class="card-img-top" alt="imagem da sala" />
                <div class="card-body">
                    <p class="card-text">
                        Tá indo, eu acho ...
                    </p>
                </div>
            </button>
        </div>
    )
}