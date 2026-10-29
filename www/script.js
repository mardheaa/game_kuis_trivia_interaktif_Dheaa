//mengimpor fungsi buat akses dan ambil data soal dari firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// konfigurasi firebase  
const firebaseConfig = {
  apiKey: "AIzaSyAdwm4rHoIzvGJvetLwIKswopR2KSr4y1s",
  authDomain: "kuispilgan-triva-interaktif.firebaseapp.com",
  projectId: "kuispilgan-triva-interaktif",
  storageBucket: "kuispilgan-triva-interaktif.firebasestorage.app",
  messagingSenderId: "14827886373",
  appId: "1:14827886373:web:7d9b087b0206a8a6ed6ccc",
};

const app = initializeApp(firebaseConfig); //aktifkan firebase diaplikasi
const db = getFirestore(app); //hubungkan apk ke db firestore

const TIME_LIMIT = 20;  //batas waktu setiap soal 20dtk
let questions = [];  //simpan semua soal yg berhasil diambil dari firebase
let currentQuestionIndex = 0;  //menyimpan posisi soal yg sdg ditampilkan
let score = 0;  //menyimpan jumlah skor
let answered = false;  //menandai apakh pemain sudah  menjawab soal
let timeLeft = TIME_LIMIT;
let timerInterval = null;

// Elemen HTML
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const nextButton = document.getElementById("next-btn");

const questionNumber = document.getElementById("question-number");
const questionElement = document.getElementById("question");
const questionPicture = document.getElementById("question-picture");
const answerButtons = document.getElementById("answer-buttons");
const scoreElement = document.getElementById("score");
const feedbackElement = document.getElementById("feedback");
const timerElement = document.getElementById("timer");
const timerProgress = document.getElementById("timer-progress");

// Suara jawaban

function playSound(isCorrect) {
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    if (isCorrect) {
      // Suara benar: nada naik, ceria, seperti game
      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(523.25, now);
      oscillator.frequency.setValueAtTime(659.25, now + 0.12);
      oscillator.frequency.setValueAtTime(783.99, now + 0.24);
      oscillator.frequency.setValueAtTime(1046.5, now + 0.36);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

      oscillator.start(now);
      oscillator.stop(now + 0.78);
    } else {
      // Suara salah: nada turun, lebih rendah dan tegas
      oscillator.type = "triangle";

      oscillator.frequency.setValueAtTime(330, now);
      oscillator.frequency.setValueAtTime(247, now + 0.18);
      oscillator.frequency.setValueAtTime(165, now + 0.36);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
      gain.gain.setValueAtTime(0.25, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      oscillator.start(now);
      oscillator.stop(now + 0.58);
    }

    oscillator.onended = () => audioContext.close();
  } catch (error) {
    console.warn("Suara tidak dapat diputar:", error);
  }
}


// Mengambil soal dari Firestore
async function loadQuestions() {
  try {
    const snapshot = await getDocs(collection(db, "soal"));

    questions = snapshot.docs
      .sort((a, b) => {
        const nomorA = Number(a.id.replace("soal", ""));
        const nomorB = Number(b.id.replace("soal", ""));
        return nomorA - nomorB;
      })
      .map((doc) => {
        const data = doc.data();

        const gambar = {
          soal1: "gambar/cuking.png",
          soal2: "gambar/angka.jpg",
          soal3: "gambar/daun.jpg",
          soal4: "gambar/pensil.jpg",
          soal5: "gambar/mata.jpg",
          soal6: "gambar/ayam.png",
          soal7: "gambar/strwbry.png",
          soal8: "gambar/bendera.png",
          soal9: "gambar/bola.png",
          soal10: "gambar/apel.jpg",
          soal11: "gambar/10.jpg",
          soal12: "gambar/donat.png",
          soal13: "gambar/zebra.jpg",
          soal14: "gambar/bintang.png",
          soal15: "gambar/lompat tali.png",
        };

        return {
          question: data.pertanyaan,
          answers: [data.pilihanA, data.pilihanB, data.pilihanC, data.pilihanD],
          correct: ["A", "B", "C", "D"].indexOf(
            String(data.jawaban ?? "")
              .trim()
              .toUpperCase(),
          ),
          picture: gambar[doc.id],
        };
      });

    const soalBermasalah = questions
      .map((q, index) => ({
        nomor: index + 1,
        pertanyaan: q.question,
        pilihan: q.answers,
        jawabanBenar: q.correct,
      }))
      .filter(
        (q) =>
          !q.pertanyaan ||
          q.pilihan.some(
            (answer) => typeof answer !== "string" || !answer.trim(),
          ) ||
          q.jawabanBenar === -1,
      );

    console.log("Jumlah soal:", questions.length);
    console.log("Soal yang bermasalah:", soalBermasalah);

    if (questions.length === 0 || soalBermasalah.length > 0) {
      throw new Error("Ada data soal yang belum lengkap.");
    }

    console.log("Soal berhasil dimuat dari Firebase:", questions);
    showStartScreen();
  } catch (error) {
    console.error("Gagal mengambil soal dari Firebase:", error);
    alert(
      "Soal gagal dimuat. Periksa konfigurasi Firebase, koneksi, dan data Firestore.",
    );

    if (startButton) startButton.disabled = true;
  }
}

// Mengacak urutan soal
function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
}

// Menampilkan halaman awal
function showStartScreen() {
  startScreen.hidden = false;
  quizScreen.hidden = true;
  resultScreen.hidden = true;

  if (startButton) startButton.disabled = false;
}

// Memulai kuis
function startQuiz() {
  if (questions.length === 0) return;

  currentQuestionIndex = 0;
  score = 0;
  shuffleQuestions();

  startScreen.hidden = true;
  quizScreen.hidden = false;
  resultScreen.hidden = true;

  scoreElement.textContent = score;
  showQuestion();
}

// Menampilkan soal
function showQuestion() {
  clearInterval(timerInterval);

  answered = false;
  timeLeft = TIME_LIMIT;

  const currentQuestion = questions[currentQuestionIndex];

  questionNumber.textContent = `Soal ${currentQuestionIndex + 1} dari ${questions.length}`;

  questionElement.textContent = currentQuestion.question;
  scoreElement.textContent = score;

  feedbackElement.textContent = "";
  nextButton.hidden = true;
  answerButtons.innerHTML = "";

  questionPicture.innerHTML = "";

  if (currentQuestion.picture) {
    const img = document.createElement("img");
    img.src = currentQuestion.picture;
    img.alt = "Gambar soal";
    img.onerror = () => {
      console.warn("Gambar tidak ditemukan:", currentQuestion.picture);
    };
    questionPicture.appendChild(img);
  }

  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-btn";
    button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;

    button.addEventListener("click", () => checkAnswer(index));
    answerButtons.appendChild(button);
  });

  updateTimerDisplay();
  startTimer();
}

// Timer
function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      if (!answered) {
        checkAnswer(-1);
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerElement.textContent = timeLeft;

  if (timerProgress) {
    timerProgress.style.width = `${Math.max(0, (timeLeft / TIME_LIMIT) * 100)}%`;
  }
}

// Memeriksa jawaban

function checkAnswer(selectedIndex) {
  if (answered) return;

  answered = true;
  clearInterval(timerInterval);

  const currentQuestion = questions[currentQuestionIndex];
  const buttons = answerButtons.querySelectorAll("button");
  const isCorrect = selectedIndex === currentQuestion.correct;

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === currentQuestion.correct) {
      button.classList.add("correct");
    }

    if (index === selectedIndex && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  if (isCorrect) {
    score += 10;
    feedbackElement.textContent = "Hebat! Jawaban kamu benar! 🎉";
  } else if (selectedIndex === -1) {
    feedbackElement.textContent = `Waktu habis! Jawaban yang benar adalah ${currentQuestion.answers[currentQuestion.correct]}. Yuk, coba lagi! 💪`;
  } else {
    feedbackElement.textContent = `Yah, belum tepat! Jawaban yang benar adalah ${currentQuestion.answers[currentQuestion.correct]}, ya! 😊`;
  }

  playSound(isCorrect);
  scoreElement.textContent = score;
  showNextButton();
}


// Tombol soal berikutnya
function showNextButton() {
  nextButton.hidden = false;

  if (currentQuestionIndex === questions.length - 1) {
    nextButton.textContent = "Lihat Hasil";
  } else {
    nextButton.textContent = "Soal Selanjutnya";
  }
}

function nextQuestion() {
  if (!answered) return;

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// Halaman hasil
function showResult() {
  clearInterval(timerInterval);

  quizScreen.hidden = true;
  resultScreen.hidden = false;

  const totalScore = questions.length * 10;

  document.getElementById("final-score").textContent = score;
  document.getElementById("score-total").textContent =
    `dari ${totalScore} poin`;

  const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;

  const resultEmoji = document.getElementById("result-emoji");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");
  const resultStars = document.getElementById("result-stars");
  const resultPredicate = document.getElementById("result-predicate");

  if (percentage >= 80) {
    resultEmoji.textContent = "🏆";
    resultTitle.textContent = "Hebat Sekali!";
    resultMessage.textContent = "Kamu pintar! Pertahankan, ya!";
    resultStars.textContent = "⭐⭐⭐";
    resultPredicate.textContent = "Luar biasa!";
  } else if (percentage >= 60) {
    resultEmoji.textContent = "🌟";
    resultTitle.textContent = "Bagus!";
    resultMessage.textContent = "Terus belajar supaya makin hebat!";
    resultStars.textContent = "⭐⭐";
    resultPredicate.textContent = "Bagus!";
  } else {
    resultEmoji.textContent = "💪";
    resultTitle.textContent = "Tetap Semangat!";
    resultMessage.textContent = "Yuk, belajar lagi dan coba sekali lagi!";
    resultStars.textContent = "⭐";
    resultPredicate.textContent = "Terus berlatih!";
  }
}

// Tombol-tombol kuis
startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", () => {
  showStartScreen();
});

// Jalankan setelah soal berhasil dimuat
loadQuestions();