-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: sistem_peminatan
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ahp_pairwise`
--

DROP TABLE IF EXISTS `ahp_pairwise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ahp_pairwise` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kriteria_id_1` int NOT NULL,
  `kriteria_id_2` int NOT NULL,
  `nilai` decimal(10,4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kriteria_id_1` (`kriteria_id_1`),
  KEY `kriteria_id_2` (`kriteria_id_2`),
  CONSTRAINT `ahp_pairwise_ibfk_1` FOREIGN KEY (`kriteria_id_1`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ahp_pairwise_ibfk_2` FOREIGN KEY (`kriteria_id_2`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ahp_pairwise`
--

LOCK TABLES `ahp_pairwise` WRITE;
/*!40000 ALTER TABLE `ahp_pairwise` DISABLE KEYS */;
INSERT INTO `ahp_pairwise` VALUES (5,1,2,3.0000),(6,2,1,0.3333),(7,1,3,3.0000),(8,3,1,0.3333),(9,1,4,3.0000),(10,4,1,0.3333),(11,1,5,2.0000),(12,5,1,0.5000),(13,2,3,3.0000),(14,3,2,0.3333),(15,2,4,2.0000),(16,4,2,0.5000),(17,2,5,3.0000),(18,5,2,0.3333),(19,3,4,3.0000),(20,4,3,0.3333),(21,3,5,2.0000),(22,5,3,0.5000),(23,4,5,1.0000),(24,5,4,1.0000),(25,1,1,1.0000),(26,2,2,1.0000),(27,3,3,1.0000),(28,4,4,1.0000),(29,5,5,1.0000);
/*!40000 ALTER TABLE `ahp_pairwise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hasil_ahp`
--

DROP TABLE IF EXISTS `hasil_ahp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hasil_ahp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siswa_id` int NOT NULL,
  `jurusan_id` int NOT NULL,
  `skor` decimal(12,6) NOT NULL,
  `ranking` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `jurusan_id` (`jurusan_id`),
  CONSTRAINT `hasil_ahp_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hasil_ahp_ibfk_2` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hasil_ahp`
--

LOCK TABLES `hasil_ahp` WRITE;
/*!40000 ALTER TABLE `hasil_ahp` DISABLE KEYS */;
/*!40000 ALTER TABLE `hasil_ahp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hasil_saw`
--

DROP TABLE IF EXISTS `hasil_saw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hasil_saw` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siswa_id` int NOT NULL,
  `jurusan_id` int NOT NULL,
  `skor` decimal(12,6) NOT NULL,
  `ranking` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `jurusan_id` (`jurusan_id`),
  CONSTRAINT `hasil_saw_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hasil_saw_ibfk_2` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hasil_saw`
--

LOCK TABLES `hasil_saw` WRITE;
/*!40000 ALTER TABLE `hasil_saw` DISABLE KEYS */;
INSERT INTO `hasil_saw` VALUES (2,1,5,1.000000,1),(3,1,2,0.745800,2),(4,1,3,0.745800,3),(5,1,4,0.548240,4),(6,1,1,0.504480,5),(7,1,6,0.400000,6),(14,4,3,1.000000,1),(15,4,1,0.600000,2),(16,4,2,0.600000,3),(17,4,4,0.600000,4),(18,4,5,0.600000,5),(19,4,6,0.600000,6);
/*!40000 ALTER TABLE `hasil_saw` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jawaban_siswa`
--

DROP TABLE IF EXISTS `jawaban_siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jawaban_siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siswa_id` int NOT NULL,
  `soal_id` int NOT NULL,
  `nilai` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `soal_id` (`soal_id`),
  CONSTRAINT `jawaban_siswa_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jawaban_siswa_ibfk_2` FOREIGN KEY (`soal_id`) REFERENCES `soal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=391 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jawaban_siswa`
--

LOCK TABLES `jawaban_siswa` WRITE;
/*!40000 ALTER TABLE `jawaban_siswa` DISABLE KEYS */;
INSERT INTO `jawaban_siswa` VALUES (91,1,26,2.00),(92,1,27,3.00),(93,1,28,3.00),(94,1,29,2.00),(95,1,30,3.00),(96,1,31,4.00),(97,1,32,4.00),(98,1,33,3.00),(99,1,34,3.00),(100,1,35,4.00),(101,1,36,4.00),(102,1,37,4.00),(103,1,38,3.00),(104,1,39,3.00),(105,1,40,4.00),(106,1,41,3.00),(107,1,42,3.00),(108,1,43,2.00),(109,1,44,3.00),(110,1,45,2.00),(111,1,46,5.00),(112,1,47,5.00),(113,1,48,5.00),(114,1,49,5.00),(115,1,50,5.00),(116,1,51,2.00),(117,1,52,2.00),(118,1,53,2.00),(119,1,54,2.00),(120,1,55,2.00),(151,2,55,5.00),(152,2,54,5.00),(153,2,53,5.00),(154,2,52,2.00),(155,2,51,4.00),(156,2,50,2.00),(157,2,49,2.00),(158,2,48,1.00),(159,2,47,5.00),(160,2,46,1.00),(161,2,45,2.00),(162,2,44,1.00),(163,2,43,4.00),(164,2,42,1.00),(165,2,41,1.00),(166,2,40,5.00),(167,2,39,2.00),(168,2,38,3.00),(169,2,37,5.00),(170,2,36,5.00),(171,2,35,1.00),(172,2,34,5.00),(173,2,33,4.00),(174,2,32,2.00),(175,2,31,2.00),(176,2,30,4.00),(177,2,29,3.00),(178,2,28,3.00),(179,2,27,3.00),(180,2,26,3.00),(361,4,55,3.00),(362,4,54,3.00),(363,4,53,3.00),(364,4,52,3.00),(365,4,51,3.00),(366,4,50,3.00),(367,4,49,3.00),(368,4,48,3.00),(369,4,47,3.00),(370,4,46,3.00),(371,4,45,3.00),(372,4,44,3.00),(373,4,43,3.00),(374,4,42,3.00),(375,4,41,3.00),(376,4,40,5.00),(377,4,39,5.00),(378,4,38,5.00),(379,4,37,5.00),(380,4,36,5.00),(381,4,35,3.00),(382,4,34,3.00),(383,4,33,3.00),(384,4,32,3.00),(385,4,31,3.00),(386,4,30,3.00),(387,4,29,3.00),(388,4,28,3.00),(389,4,27,3.00),(390,4,26,3.00);
/*!40000 ALTER TABLE `jawaban_siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jurusan`
--

DROP TABLE IF EXISTS `jurusan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jurusan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(10) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `deskripsi` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kode` (`kode`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jurusan`
--

LOCK TABLES `jurusan` WRITE;
/*!40000 ALTER TABLE `jurusan` DISABLE KEYS */;
INSERT INTO `jurusan` VALUES (1,'MPLB','Manajemen Perkantoran dan Layanan Bisnis',NULL),(2,'AKL','Akuntansi dan Keuangan Lembaga',NULL),(3,'TKRO','Teknik Kendaraan Ringan Otomotif',NULL),(4,'TBSM','Teknik dan Bisnis Sepeda Motor',NULL),(5,'TJKT','Teknik Jaringan Komputer dan Telekomunikasi',NULL),(6,'DKV','Desain Komunikasi Visual',NULL);
/*!40000 ALTER TABLE `jurusan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kriteria`
--

DROP TABLE IF EXISTS `kriteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kriteria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `tipe` enum('benefit','cost') DEFAULT 'benefit',
  `bobot_ahp` decimal(10,4) DEFAULT '0.0000',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kriteria`
--

LOCK TABLES `kriteria` WRITE;
/*!40000 ALTER TABLE `kriteria` DISABLE KEYS */;
INSERT INTO `kriteria` VALUES (1,'Minat','benefit',0.3772),(2,'Bakat','benefit',0.2486),(3,'Akademik','benefit',0.1695),(4,'Peluang Kerja','benefit',0.0968),(5,'Psikotes','benefit',0.1079);
/*!40000 ALTER TABLE `kriteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_aktivitas`
--

DROP TABLE IF EXISTS `log_aktivitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_aktivitas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `aktivitas` text,
  `waktu` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_aktivitas`
--

LOCK TABLES `log_aktivitas` WRITE;
/*!40000 ALTER TABLE `log_aktivitas` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_aktivitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nilai_siswa`
--

DROP TABLE IF EXISTS `nilai_siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nilai_siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `siswa_id` int NOT NULL,
  `jurusan_id` int NOT NULL,
  `kriteria_id` int NOT NULL,
  `nilai_mentah` decimal(10,2) DEFAULT NULL,
  `nilai_terbobot` decimal(12,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `siswa_id` (`siswa_id`),
  KEY `jurusan_id` (`jurusan_id`),
  KEY `kriteria_id` (`kriteria_id`),
  CONSTRAINT `nilai_siswa_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nilai_siswa_ibfk_2` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nilai_siswa_ibfk_3` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nilai_siswa`
--

LOCK TABLES `nilai_siswa` WRITE;
/*!40000 ALTER TABLE `nilai_siswa` DISABLE KEYS */;
INSERT INTO `nilai_siswa` VALUES (8,1,1,1,2.00,NULL),(9,1,1,2,3.00,NULL),(10,1,1,3,3.00,NULL),(11,1,1,4,2.00,NULL),(12,1,1,5,3.00,NULL),(13,1,2,1,4.00,NULL),(14,1,2,2,4.00,NULL),(15,1,2,3,3.00,NULL),(16,1,2,4,3.00,NULL),(17,1,2,5,4.00,NULL),(18,1,3,1,4.00,NULL),(19,1,3,2,4.00,NULL),(20,1,3,3,3.00,NULL),(21,1,3,4,3.00,NULL),(22,1,3,5,4.00,NULL),(23,1,4,1,3.00,NULL),(24,1,4,2,3.00,NULL),(25,1,4,3,2.00,NULL),(26,1,4,4,3.00,NULL),(27,1,4,5,2.00,NULL),(28,1,5,1,5.00,NULL),(29,1,5,2,5.00,NULL),(30,1,5,3,5.00,NULL),(31,1,5,4,5.00,NULL),(32,1,5,5,5.00,NULL),(33,1,6,1,2.00,NULL),(34,1,6,2,2.00,NULL),(35,1,6,3,2.00,NULL),(36,1,6,4,2.00,NULL),(37,1,6,5,2.00,NULL),(70,2,1,1,3.00,NULL),(71,2,1,2,3.00,NULL),(72,2,1,3,3.00,NULL),(73,2,1,4,3.00,NULL),(74,2,1,5,4.00,NULL),(75,2,2,1,2.00,NULL),(76,2,2,2,2.00,NULL),(77,2,2,3,4.00,NULL),(78,2,2,4,5.00,NULL),(79,2,2,5,1.00,NULL),(80,2,3,1,5.00,NULL),(81,2,3,2,5.00,NULL),(82,2,3,3,3.00,NULL),(83,2,3,4,2.00,NULL),(84,2,3,5,5.00,NULL),(85,2,4,1,1.00,NULL),(86,2,4,2,1.00,NULL),(87,2,4,3,4.00,NULL),(88,2,4,4,1.00,NULL),(89,2,4,5,2.00,NULL),(90,2,5,1,1.00,NULL),(91,2,5,2,5.00,NULL),(92,2,5,3,1.00,NULL),(93,2,5,4,2.00,NULL),(94,2,5,5,2.00,NULL),(95,2,6,1,4.00,NULL),(96,2,6,2,2.00,NULL),(97,2,6,3,5.00,NULL),(98,2,6,4,5.00,NULL),(99,2,6,5,5.00,NULL),(256,4,6,5,3.00,NULL),(257,4,6,4,3.00,NULL),(258,4,6,3,3.00,NULL),(259,4,6,2,3.00,NULL),(260,4,6,1,3.00,NULL),(261,4,5,5,3.00,NULL),(262,4,5,4,3.00,NULL),(263,4,5,3,3.00,NULL),(264,4,5,2,3.00,NULL),(265,4,5,1,3.00,NULL),(266,4,4,5,3.00,NULL),(267,4,4,4,3.00,NULL),(268,4,4,3,3.00,NULL),(269,4,4,2,3.00,NULL),(270,4,4,1,3.00,NULL),(271,4,3,5,5.00,NULL),(272,4,3,4,5.00,NULL),(273,4,3,3,5.00,NULL),(274,4,3,2,5.00,NULL),(275,4,3,1,5.00,NULL),(276,4,2,5,3.00,NULL),(277,4,2,4,3.00,NULL),(278,4,2,3,3.00,NULL),(279,4,2,2,3.00,NULL),(280,4,2,1,3.00,NULL),(281,4,1,5,3.00,NULL),(282,4,1,4,3.00,NULL),(283,4,1,3,3.00,NULL),(284,4,1,2,3.00,NULL),(285,4,1,1,3.00,NULL);
/*!40000 ALTER TABLE `nilai_siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `siswa`
--

DROP TABLE IF EXISTS `siswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `nisn` varchar(20) NOT NULL,
  `kelas` varchar(50) DEFAULT NULL,
  `jurusan_asal` varchar(50) DEFAULT NULL,
  `tahun_ajaran` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nisn` (`nisn`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `siswa`
--

LOCK TABLES `siswa` WRITE;
/*!40000 ALTER TABLE `siswa` DISABLE KEYS */;
INSERT INTO `siswa` VALUES (1,2,'Ahmad Assidiq','1234567890','XI','SMP','2025'),(2,3,'sandiaga uno','1234568970','XI','SMP','2025'),(3,4,'putri ayu anjani','0920940194','X','tkj','2025/2026'),(4,5,'ronaldo wati','9249189421','XI','tkj','2025/2026');
/*!40000 ALTER TABLE `siswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soal`
--

DROP TABLE IF EXISTS `soal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pertanyaan` text NOT NULL,
  `kriteria_id` int NOT NULL,
  `jurusan_id` int DEFAULT NULL,
  `tipe` enum('skala','pilihan','isian') DEFAULT 'skala',
  PRIMARY KEY (`id`),
  KEY `kriteria_id` (`kriteria_id`),
  KEY `jurusan_id` (`jurusan_id`),
  CONSTRAINT `soal_ibfk_1` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria` (`id`) ON DELETE CASCADE,
  CONSTRAINT `soal_ibfk_2` FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soal`
--

LOCK TABLES `soal` WRITE;
/*!40000 ALTER TABLE `soal` DISABLE KEYS */;
INSERT INTO `soal` VALUES (1,'Seberapa sering Anda membaca berita, artikel, atau informasi terkait dunia bisnis dan perkantoran (MPLB/AKL)?',1,NULL,'skala'),(2,'Apakah Anda suka membongkar pasang alat, mesin, atau mencari tahu cara kerja kendaraan (TKRO/TBSM)?',1,NULL,'skala'),(3,'Saya menikmati kegiatan yang membutuhkan logika, pemrograman, dan perangkat keras (TJKT).',1,NULL,'skala'),(4,'Saya merasa bosan jika harus menghabiskan waktu berjam-jam untuk menggambar, membuat desain, atau mengedit foto/video (DKV).',1,NULL,'skala'),(5,'Saya memiliki hobi yang secara langsung berkaitan dengan salah satu jurusan yang tersedia di sekolah.',1,NULL,'skala'),(6,'Saya cepat menguasai dan memahami cara kerja software baru, terutama yang berhubungan dengan pengarsipan atau akuntansi.',2,NULL,'skala'),(7,'Saya mampu mengikuti instruksi teknis yang detail, seperti merakit atau memperbaiki sesuatu tanpa harus diajari berulang kali.',2,NULL,'skala'),(8,'Orang lain sering meminta bantuan saya untuk menyelesaikan masalah komputer atau jaringan internet.',2,NULL,'skala'),(9,'Saya memiliki kemampuan untuk membayangkan objek 3D atau ruang (visual spatial) dengan mudah.',2,NULL,'skala'),(10,'Saya bisa dengan mudah meniru nada, irama, atau gerakan yang saya lihat/dengar.',2,NULL,'skala'),(11,'Saya mendapatkan nilai rata-rata yang konsisten tinggi di mata pelajaran Matematika selama setahun terakhir.',3,NULL,'skala'),(12,'Saya mendapatkan nilai rata-rata yang konsisten tinggi di mata pelajaran Bahasa Inggris.',3,NULL,'skala'),(13,'Saya mampu memecahkan masalah yang memerlukan penalaran numerik dan pemahaman rumus-rumus fisika/kimia.',3,NULL,'skala'),(14,'Saya merasa sulit memahami konsep ekonomi dan dasar-dasar akuntansi.',3,NULL,'skala'),(15,'Nilai mata pelajaran Seni Budaya/Keterampilan saya lebih tinggi daripada mata pelajaran eksak lainnya.',3,NULL,'skala'),(16,'Saya membayangkan diri saya bekerja di kantor, menggunakan pakaian formal, dan berinteraksi dengan klien.',4,NULL,'skala'),(17,'Saya bersedia bekerja di bengkel atau lingkungan yang menuntut kerja fisik dan kotor.',4,NULL,'skala'),(18,'Saya tertarik pada pekerjaan yang berhubungan dengan teknologi yang berkembang pesat (IT, jaringan, cyber security).',4,NULL,'skala'),(19,'Saya lebih memilih pekerjaan yang melibatkan kreativitas, desain grafis, dan pemasaran visual daripada pekerjaan administrasi.',4,NULL,'skala'),(20,'Bagi saya, gaji besar lebih penting daripada minat pribadi dalam memilih bidang karir.',4,NULL,'skala'),(21,'Saya memiliki ketelitian tinggi dan jarang melakukan kesalahan saat menyalin atau memasukkan data.',5,NULL,'skala'),(22,'Saya orang yang sabar dan teliti saat menyelesaikan masalah, meskipun masalah itu membutuhkan waktu yang lama (ketekunan).',5,NULL,'skala'),(23,'Saya dapat mengambil keputusan dengan cepat dan bertindak tegas di bawah tekanan.',5,NULL,'skala'),(24,'Saya mudah beradaptasi dengan tim baru dan bisa menjadi komunikator yang baik.',5,NULL,'skala'),(25,'Saya adalah orang yang cenderung introvert dan lebih suka bekerja sendiri daripada di dalam kelompok.',5,NULL,'skala'),(26,'Saya tertarik pada pekerjaan administrasi dan pengarsipan.',1,1,'skala'),(27,'Saya memiliki keterampilan organisasi yang baik.',2,1,'skala'),(28,'Nilai Bahasa Indonesia saya tinggi.',3,1,'skala'),(29,'Saya ingin bekerja di lingkungan kantor formal.',4,1,'skala'),(30,'Saya teliti saat mengatur jadwal atau dokumen.',5,1,'skala'),(31,'Saya senang menghitung dan menganalisis laporan keuangan.',1,2,'skala'),(32,'Saya memiliki bakat dalam menemukan kesalahan hitung.',2,2,'skala'),(33,'Nilai Matematika saya tinggi.',3,2,'skala'),(34,'Saya ingin bekerja sebagai akuntan/staf keuangan.',4,2,'skala'),(35,'Saya orang yang jujur dan dapat dipercaya dalam hal uang.',5,2,'skala'),(36,'Saya suka memodifikasi atau memperbaiki mesin kendaraan.',1,3,'skala'),(37,'Saya memahami instruksi mekanis yang kompleks.',2,3,'skala'),(38,'Nilai Fisika saya bagus.',3,3,'skala'),(39,'Saya bersedia bekerja di bengkel.',4,3,'skala'),(40,'Saya bisa bekerja dengan detail kecil dan alat-alat teknis.',5,3,'skala'),(41,'Saya memiliki ketertarikan pada sepeda motor dan teknologi mesin 2/4 tak.',1,4,'skala'),(42,'Saya mudah belajar merakit komponen kecil.',2,4,'skala'),(43,'Nilai Keterampilan/Praktek saya bagus.',3,4,'skala'),(44,'Saya siap bekerja sebagai teknisi motor.',4,4,'skala'),(45,'Saya memiliki koordinasi tangan dan mata yang baik.',5,4,'skala'),(46,'Saya menikmati memecahkan masalah jaringan atau software.',1,5,'skala'),(47,'Saya memiliki pemahaman yang baik tentang logika pemrograman.',2,5,'skala'),(48,'Nilai mata pelajaran Komputer/Informatika saya tinggi.',3,5,'skala'),(49,'Saya tertarik pada karir di bidang IT/Cyber Security.',4,5,'skala'),(50,'Saya mampu fokus pada tugas yang abstrak dan digital.',5,5,'skala'),(51,'Saya senang menggambar, mendesain, atau mengedit foto/video.',1,6,'skala'),(52,'Saya memiliki bakat visual dan kreatif.',2,6,'skala'),(53,'Nilai Seni Budaya/Rupa saya tinggi.',3,6,'skala'),(54,'Saya ingin bekerja di industri kreatif atau agensi desain.',4,6,'skala'),(55,'Saya mampu berpikir \"out of the box\" dan menghasilkan ide baru.',5,6,'skala'),(56,'jika mengganti baut dengan ukuran yang berbeda akan merusak komponenet sepeda motor',3,4,'skala');
/*!40000 ALTER TABLE `soal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','siswa') DEFAULT 'siswa',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin123','admin','2025-10-03 17:26:19'),(2,'ahmad','$2b$10$36rL07tKoAU10GOalhTl5.b1x7CBMKvyfr4jGYS9LtUKUS14/OjTC','siswa','2025-10-04 04:29:13'),(3,'sandi','$2b$10$M2/k9cpVQrid.PWy00sncOcmwxgt3BdCTVqvORlSGMtno5SAIGLl.','siswa','2025-10-04 04:47:05'),(4,'anjani','$2b$10$sHssvgqBqUr17owBsOa8eOgv4WUBg3hDsNFyJoqZ6VbNb29h7p4MK','siswa','2025-10-04 07:23:36'),(5,'ronal','$2b$10$2RFrr/GxYPLWSBrUd3xu6eRnCUvXmu7GlJQfuaDS6MAkGeF4oVgte','siswa','2025-10-04 07:26:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-04 15:57:03
