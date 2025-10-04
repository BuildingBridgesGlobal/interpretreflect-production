SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: affirmations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."affirmations" ("id", "user_id", "affirmation_type", "content", "created_at") OVERRIDING SYSTEM VALUE VALUES
	(1, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":0}}', '2025-09-17 23:56:47.528+00'),
	(2, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":0}}', '2025-09-17 23:56:49.166+00'),
	(3, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 01:01:34.159+00'),
	(4, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 01:01:36.595+00'),
	(5, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 01:06:35.304+00'),
	(6, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 02:14:42.987+00'),
	(7, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 02:14:44.983+00'),
	(8, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:23:04.664+00'),
	(9, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:23:06.433+00'),
	(10, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:28:05.705+00'),
	(11, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:33:05.492+00'),
	(12, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:38:05.689+00'),
	(13, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:43:05.45+00'),
	(14, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:48:05.536+00'),
	(15, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 03:53:05.627+00'),
	(16, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 04:09:05.392+00'),
	(17, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-18 05:17:09.855+00'),
	(18, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 05:51:05.852+00'),
	(19, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 05:51:07.259+00'),
	(20, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 06:50:42.897+00'),
	(21, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 06:50:44.824+00'),
	(22, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 06:55:43.921+00'),
	(23, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 07:00:43.627+00'),
	(24, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 07:05:43.962+00'),
	(25, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 07:10:43.667+00'),
	(26, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 07:15:43.81+00'),
	(27, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 12:39:57.207+00'),
	(28, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 12:39:59.377+00'),
	(29, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 12:44:58.585+00'),
	(30, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 12:49:58.335+00'),
	(31, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 19:08:27.234+00'),
	(32, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-18 19:08:29.475+00'),
	(33, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 00:36:50.586+00'),
	(34, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 00:36:53.073+00'),
	(35, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:50:35.234+00'),
	(36, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:50:37.876+00'),
	(37, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:50:38.462+00'),
	(38, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:50:58.957+00'),
	(39, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:51:49.976+00'),
	(40, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 01:51:52.366+00'),
	(41, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:14:14.914+00'),
	(42, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:45:28.624+00'),
	(43, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:45:31.432+00'),
	(44, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:49:38.793+00'),
	(45, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:49:40.482+00'),
	(46, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:53:34.515+00'),
	(47, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 02:53:36.526+00'),
	(48, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:03:00.609+00'),
	(49, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:03:03.263+00'),
	(50, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:03:05.132+00'),
	(51, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:03:24.593+00'),
	(52, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:10:41.145+00'),
	(53, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:10:43.633+00'),
	(54, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:10:45.695+00'),
	(55, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:18:36.281+00'),
	(56, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:18:38.851+00'),
	(57, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:18:40.776+00'),
	(58, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:20:41.518+00'),
	(59, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:20:43.384+00'),
	(60, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:20:45.346+00'),
	(61, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:25:42.997+00'),
	(62, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:26:32.272+00'),
	(63, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:26:33.386+00'),
	(64, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:39:52.71+00'),
	(65, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:39:54.201+00'),
	(66, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:45:16.303+00'),
	(67, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:45:17.815+00'),
	(68, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:50:42.11+00'),
	(69, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:50:43.245+00'),
	(70, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Mon Sep 15 2025","affirmation":{"category":"worth","index":1}}', '2025-09-19 03:55:40.123+00'),
	(71, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Fri Sep 19 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-19 04:51:11.566+00'),
	(72, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Fri Sep 19 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-19 04:51:13.022+00'),
	(73, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Fri Sep 19 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-19 17:46:58.941+00'),
	(74, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Fri Sep 19 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-19 17:47:01.266+00'),
	(75, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Fri Sep 19 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-19 17:47:03.052+00'),
	(76, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 18:02:39.997+00'),
	(77, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 18:02:41.843+00'),
	(78, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 18:02:42.972+00'),
	(79, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 19:09:06.509+00'),
	(80, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 19:09:08.304+00'),
	(81, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 23:07:06.022+00'),
	(82, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 23:07:08.054+00'),
	(83, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-19 23:07:09.8+00'),
	(84, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 00:45:42.113+00'),
	(85, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 00:45:43.712+00'),
	(86, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 00:45:45.169+00'),
	(87, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 00:50:42.844+00'),
	(88, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 00:55:42.916+00'),
	(89, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:00:42.895+00'),
	(90, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:05:43.013+00'),
	(91, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:10:42.855+00'),
	(92, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:15:42.894+00'),
	(93, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:20:42.856+00'),
	(94, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:25:42.865+00'),
	(95, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 01:30:42.906+00'),
	(96, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:08:41.405+00'),
	(97, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:08:42.871+00'),
	(98, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:40:42.023+00'),
	(99, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:40:43.072+00'),
	(100, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:45:41.191+00'),
	(101, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-20 18:50:41.336+00'),
	(102, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 14:50:43.789+00'),
	(103, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 14:50:45.853+00'),
	(104, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 14:55:42.203+00'),
	(105, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:00:42.078+00'),
	(106, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:05:42.22+00'),
	(107, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:10:41.976+00'),
	(108, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:15:42.223+00'),
	(109, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:20:42.093+00'),
	(110, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:25:42.172+00'),
	(111, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:30:42.035+00'),
	(112, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:35:42.211+00'),
	(113, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:58:55.327+00'),
	(114, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-21 15:58:56.92+00'),
	(115, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-22 00:11:11.354+00'),
	(116, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-22 00:11:13.047+00'),
	(117, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 17 2025","affirmation":{"category":"purpose","index":4}}', '2025-09-22 00:11:14.658+00'),
	(118, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:16:12.136+00'),
	(119, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:21:12.039+00'),
	(120, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:26:11.994+00'),
	(121, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:31:11.977+00'),
	(122, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:36:12.33+00'),
	(123, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:41:11.873+00'),
	(124, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:46:12.007+00'),
	(125, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:51:11.969+00'),
	(126, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 00:56:12.105+00'),
	(127, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:23:31.911+00'),
	(128, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:23:33.086+00'),
	(129, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:28:30.859+00'),
	(130, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:33:31.039+00'),
	(131, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:38:30.903+00'),
	(132, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:43:31.084+00'),
	(133, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:48:31.004+00'),
	(134, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 03:53:30.926+00'),
	(135, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 04:27:24.205+00'),
	(136, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 04:27:26.14+00'),
	(137, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 04:27:26.48+00'),
	(138, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 13:46:07.144+00'),
	(139, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 13:46:09.195+00'),
	(140, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 13:46:10.41+00'),
	(141, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 13:46:35.319+00'),
	(142, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 13:46:36.549+00'),
	(143, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 15:09:28.564+00'),
	(144, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 15:09:31.172+00'),
	(145, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:28:38.581+00'),
	(146, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:28:40.94+00'),
	(147, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:28:43.93+00'),
	(148, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:33:39.487+00'),
	(149, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:38:39.511+00'),
	(150, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 18:39:42.325+00'),
	(151, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-22 21:17:26.529+00'),
	(152, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:34:27.338+00'),
	(153, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:34:28.4+00'),
	(154, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:40:03.048+00'),
	(155, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:40:04.417+00'),
	(156, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:52:38.818+00'),
	(157, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:52:40.483+00'),
	(158, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 02:57:37.359+00'),
	(159, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Sun Sep 21 2025","affirmation":{"category":"boundaries","index":1}}', '2025-09-23 03:02:37.574+00'),
	(160, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:14:02.72+00'),
	(161, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:14:05.455+00'),
	(162, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:14:07.161+00'),
	(163, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:19:03.993+00'),
	(164, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:24:04.112+00'),
	(165, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:29:04.079+00'),
	(166, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:34:04.176+00'),
	(167, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:39:04.031+00'),
	(168, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 02:44:04.18+00'),
	(169, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 03:21:40.17+00'),
	(170, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Tue Sep 23 2025","affirmation":{"category":"wisdom","index":4}}', '2025-09-24 03:21:43.308+00'),
	(171, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 04:45:37.169+00'),
	(172, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 04:45:39.418+00'),
	(173, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 05:59:25.702+00'),
	(174, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 05:59:27.253+00'),
	(175, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 05:59:28.05+00'),
	(176, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 13:42:57.199+00'),
	(177, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 13:42:59.34+00'),
	(178, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 13:43:00.866+00'),
	(179, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 15:12:34.754+00'),
	(180, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 15:12:37.75+00'),
	(181, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 16:16:27.532+00'),
	(182, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 16:16:30.03+00'),
	(183, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 16:21:29.331+00'),
	(184, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 16:24:22.523+00'),
	(185, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 17:55:53.877+00'),
	(186, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 17:55:56.53+00'),
	(187, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 17:55:58.243+00'),
	(188, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 18:00:55.079+00'),
	(189, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 18:05:55.285+00'),
	(190, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 19:08:19.741+00'),
	(191, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 19:08:23.062+00'),
	(192, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:24:35.832+00'),
	(193, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:24:39.087+00'),
	(194, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:29:37.348+00'),
	(195, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:34:37.493+00'),
	(196, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:39:37.364+00'),
	(197, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:44:37.634+00'),
	(198, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:49:37.369+00'),
	(199, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 20:54:37.488+00'),
	(200, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 22:56:37.54+00'),
	(201, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 22:56:39.772+00'),
	(202, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:01:35.76+00'),
	(203, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:06:35.374+00'),
	(204, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:11:35.297+00'),
	(205, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:16:35.504+00'),
	(206, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:21:35.282+00'),
	(207, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:26:35.664+00'),
	(208, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:38:57.51+00'),
	(209, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-24 23:38:59.459+00'),
	(210, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 00:58:52.016+00'),
	(211, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 00:58:54.673+00'),
	(212, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 01:03:53.521+00'),
	(213, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 14:06:00.581+00'),
	(214, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 14:06:02.675+00'),
	(215, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 14:10:57.795+00'),
	(216, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 14:29:53.764+00'),
	(217, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'daily', '{"date":"Wed Sep 24 2025","affirmation":{"category":"resilience","index":3}}', '2025-09-25 14:29:54.908+00');


--
-- Data for Name: affirmation_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analytics_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: analytics_users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: anonymized_reflections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."plans" ("id", "retention_days") VALUES
	('basic', 30),
	('pro', 90),
	('enterprise', 3650);


--
-- Data for Name: orgs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: attestation_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: body_checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: burnout_alert_thresholds; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: burnout_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: burnout_assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."burnout_assessments" ("id", "user_id", "assessment_date", "burnout_score", "risk_level", "symptoms", "recovery_recommendations", "created_at", "energy_tank", "recovery_speed", "emotional_leakage", "performance_signal", "tomorrow_readiness", "total_score", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(2, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-22 18:29:59.586+00', 6.50, 'high', '{"energy_tank": 5, "recovery_speed": 4, "emotional_leakage": 1, "performance_signal": 5, "tomorrow_readiness": 3}', NULL, '2025-09-22 03:46:13.692116+00', 5, 4, 1, 5, 3, '18', '2025-09-22 18:30:00.232424+00'),
	(6, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-24 00:00:00+00', NULL, 'high', '{}', NULL, '2025-09-24 16:18:45.998482+00', 3, 3, 3, 3, 3, '13', '2025-09-24 16:18:45.998482+00');


--
-- Data for Name: recommendation_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: burnout_recommendations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: consent_flags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: context_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: credential_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: daily_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."daily_activity" ("id", "user_id", "activity_date", "activities_completed", "created_at", "updated_at") OVERRIDING SYSTEM VALUE VALUES
	(1, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-19 00:00:00+00', '{reflection}', '2025-09-19 18:04:38.951+00', '2025-09-19 18:04:39.074177+00'),
	(2, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-20 00:00:00+00', '{reflection}', '2025-09-20 18:41:23.942+00', '2025-09-20 18:41:24.095202+00'),
	(3, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-21 00:00:00+00', '{reflection}', '2025-09-21 14:51:18.033+00', '2025-09-21 14:51:18.268125+00'),
	(4, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-24 00:00:00+00', '{reflection}', '2025-09-24 16:18:45.919+00', '2025-09-24 16:18:46.026754+00');


--
-- Data for Name: daily_burnout_checks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."daily_burnout_checks" ("id", "user_id", "check_date", "energy_tank", "energy_score", "recovery_speed", "recovery_score", "emotional_leakage", "emotional_score", "performance_signal", "performance_score", "tomorrow_readiness", "readiness_score", "notes", "created_at", "assessment_date", "energy_level", "stress_level", "motivation_level", "work_satisfaction", "emotional_exhaustion", "burnout_risk_score") VALUES
	('ca66c93f-56e9-4438-adb1-84b82e1e548b', '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '2025-09-25', 'half_tank', 5, 'medium', 5, 'noticeable', 5, 'normal', 5, 'mostly_ready', 5, 'Sample entry to unblock UI', '2025-09-25 01:06:34.679339+00', '2025-09-25 01:06:34.679339+00', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: daily_burnout_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: elya_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: emotion_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: emotional_contagion_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: event_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_definitions" ("event_name", "required_props", "description", "updated_at") VALUES
	('ir.app_opened', '{"build": "text", "platform": "text", "entrypoint": "text", "is_returning": "bool"}', 'App opened', '2025-09-13 14:00:51.664945+00'),
	('ir.auth_signed_in', '{"plan": "text", "provider": "text", "email_hash": "text"}', 'Auth success', '2025-09-13 14:00:51.664945+00'),
	('ir.auth_signed_out', '{"reason": "text"}', 'Auth sign-out', '2025-09-13 14:00:51.664945+00'),
	('ir.journal_opened', '{"route": "text", "from_recommendation": "bool"}', 'Journal view', '2025-09-13 14:00:51.664945+00'),
	('ir.journal_entry_created', '{"tags": "array", "length_chars": "int", "mood_valence": "int"}', 'New journal entry', '2025-09-13 14:00:51.664945+00'),
	('ir.journal_entry_submitted_for_reflection', '{"agent": "text", "tokens_in": "int", "latency_ms": "int", "tokens_out": "int"}', 'Agent request', '2025-09-13 14:00:51.664945+00'),
	('ir.agent_feedback_delivered', '{"agent": "text", "score": "int", "rubric": "text"}', 'Feedback shown', '2025-09-13 14:00:51.664945+00'),
	('ir.beta_feedback_submitted', '{"category": "text", "severity": "int"}', 'Beta feedback', '2025-09-13 14:00:51.664945+00'),
	('ir.consent_updated', '{"scope": "text", "granted": "bool"}', 'Consent toggle', '2025-09-13 14:00:51.664945+00'),
	('ir.checkout_started', '{"sku": "text", "coupon": "text", "price_usd": "numeric", "trial_days": "int"}', 'Checkout start', '2025-09-13 14:00:51.664945+00'),
	('ir.checkout_completed', '{"sku": "text", "coupon": "text", "price_usd": "numeric", "trial_days": "int"}', 'Checkout end', '2025-09-13 14:00:51.664945+00'),
	('ir.error', '{"code": "text", "fatal": "bool", "surface": "text", "message_hash": "text"}', 'App error', '2025-09-13 14:00:51.664945+00');


--
-- Data for Name: journal_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feedback_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: growth_insights; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: metrics_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pattern_insights; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: practice_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: privacy_audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "stripe_customer_id", "subscription_status", "subscription_tier", "created_at", "updated_at", "onboarding_completed", "terms_accepted_at", "terms_version", "privacy_version") VALUES
	('395cd541-1ad7-4bb5-880d-489d2d13b5da', NULL, NULL, 'free', NULL, '2025-09-19 03:17:36.621431+00', '2025-09-19 03:17:36.621431+00', false, NULL, NULL, NULL),
	('39ed3ac2-7729-4d62-94e9-623d43242755', NULL, NULL, 'free', NULL, '2025-09-19 03:17:36.621431+00', '2025-09-19 03:17:36.621431+00', false, NULL, NULL, NULL),
	('cd895afe-3bf1-487c-baa3-bcd798871c2a', NULL, NULL, 'free', NULL, '2025-09-19 03:17:36.621431+00', '2025-09-19 03:17:36.621431+00', false, NULL, NULL, NULL),
	('6be736bc-2ec2-487d-8f5f-f8eaacb053c5', NULL, NULL, 'free', NULL, '2025-09-19 03:17:36.621431+00', '2025-09-19 03:17:36.621431+00', false, '2025-09-24 05:59:38.096+00', '3.0.1', '3.0.1');


--
-- Data for Name: recovery_habits; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reflection_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reflection_entries" ("id", "user_id", "entry_kind", "data", "created_at", "updated_at", "reflection_id") OVERRIDING SYSTEM VALUE VALUES
	(86, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', 'wellness_checkin', '{"timestamp": "2025-09-24T16:29:17.729Z", "energyLevel": 10, "focus_level": "fasdf", "stressLevel": 5, "stress_level": 5, "check_in_date": "2025-09-24", "sleep_quality": 6, "cognitive_load": "asd", "current_energy": 5, "gratitude_note": "asdef", "mental_clarity": 5, "physical_state": "dfa", "wellness_score": 7, "check_in_reason": "support", "current_feeling": "dfas", "immediate_needs": "fdsa", "overall_feeling": "dfas", "primary_emotions": "fasd", "support_required": "asd", "physical_symptoms": "asdfas", "wellness_priority": "adfs", "work_satisfaction": "sad", "connection_quality": 5, "emotional_triggers": "asd", "relationship_needs": "fasd", "sections_completed": 8, "time_spent_seconds": 0, "available_resources": "fas", "emotional_intensity": 5, "self_care_commitment": "asf", "support_availability": "asd", "professional_stressors": "fasd", "overall_wellness_rating": 5, "workload_sustainability": 5}', '2025-09-24 16:29:20.873732+00', '2025-09-24 16:29:20.873732+00', '686137a1-5399-4866-a3c4-1bb460fca2bf');


--
-- Data for Name: reflection_entries_new; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reflection_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reflections; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reflections_lookup; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stress_reset_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_emotional_climate; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: technique_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: technique_usage_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: terms_acceptances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."terms_acceptances" ("id", "user_id", "terms_version", "privacy_version", "accepted_at", "ip_address", "user_agent", "terms_content_hash", "privacy_content_hash", "created_at") OVERRIDING SYSTEM VALUE VALUES
	(2, '6be736bc-2ec2-487d-8f5f-f8eaacb053c5', '3.0.1', '3.0.1', '2025-09-24 05:59:38.008+00', NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '5d382a4a', '44a7246c', '2025-09-24 05:59:38.087437+00');


--
-- Data for Name: ui_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_context_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_growth_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_interventions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: wellness_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: zero_knowledge_proofs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: affirmation_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."affirmation_favorites_id_seq"', 1, false);


--
-- Name: affirmations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."affirmations_id_seq"', 217, true);


--
-- Name: analytics_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."analytics_sessions_id_seq"', 1, false);


--
-- Name: attestation_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."attestation_receipts_id_seq"', 1, false);


--
-- Name: burnout_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."burnout_assessments_id_seq"', 6, true);


--
-- Name: daily_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."daily_activity_id_seq"', 4, true);


--
-- Name: practice_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."practice_sessions_id_seq"', 1, false);


--
-- Name: reflection_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reflection_entries_id_seq"', 86, true);


--
-- Name: reflection_entries_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."reflection_entries_new_id_seq"', 1, false);


--
-- Name: stress_reset_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."stress_reset_logs_id_seq"', 1, false);


--
-- Name: terms_acceptances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."terms_acceptances_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
