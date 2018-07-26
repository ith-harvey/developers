package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

// GetOrderRequest is an incoming POST request from the client server
type GetOrderRequest struct {
	MakerAddress string `json:"makerAddress"`
	TakerAddress string `json:"takerAddress"`
	MakerToken   string `json:"makerToken"`
	TakerToken   string `json:"takerToken"`
	TakerAmount  string `json:"takerAmount"`
	MakerAmount  string `json:"makerAmount"`
}

// GetOrderResponse is an outgoing order to be signed and sent by the client server.
type GetOrderResponse struct {
	MakerToken  string `json:"makerToken"`
	TakerToken  string `json:"takerToken"`
	MakerAmount string `json:"makerAmount"`
	TakerAmount string `json:"takerAmount"`
	Expiration  int64  `json:"expiration"`
	Nonce       uint32 `json:"nonce"`
}

func getOrder(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("bad request method: %s", r.Method)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var request GetOrderRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		log.Printf("bad request: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Only one or the other should be set
	// Takers will usually request a makerAmount
	// In this example, we're assuming they're requesting a makerAmount
	if request.MakerAmount != "" {
		makerAmount, err := strconv.Atoi(request.MakerAmount)
		if err != nil {
			log.Printf("bad makerAmount format: %s", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		expiration := int64(time.Now().Add(5 * time.Minute).Unix())
		nonce := uint32(rand.Intn(99999))

		const price = 0.5
		takerAmount := float64(makerAmount) * price

		order := GetOrderResponse{
			MakerToken:  request.MakerToken,
			TakerToken:  request.TakerToken,
			MakerAmount: request.MakerAmount,
			TakerAmount: strconv.Itoa(int(takerAmount)),
			Expiration:  expiration,
			Nonce:       nonce,
		}
		response, err := json.Marshal(order)
		if err != nil {
			log.Printf("error encoding JSON response: %s", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Add("content-type", "application/json")
		w.Write(response)
	} else if request.TakerAmount != "" {
		// Handle takerAmount requested
	} else {
		log.Printf("bad request: no maker or taker amount supplied")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
}

func main() {
	http.HandleFunc("/getOrder", getOrder)
	log.Fatal(http.ListenAndServe(":5004", nil))
}
