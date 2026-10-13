-- Driftline A3: import into a NEW, selected MySQL database.
-- No CREATE DATABASE or USE statement: works with cPanel account-prefixed database names.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE organizations (
  organization_id INT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  contact_email VARCHAR(150) NOT NULL,
  city VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE events (
  event_id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  summary VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  purpose VARCHAR(300) NOT NULL,
  location_name VARCHAR(120) NOT NULL,
  suburb VARCHAR(80) NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meeting_point VARCHAR(250) NOT NULL,
  ticket_price DECIMAL(8,2) NOT NULL DEFAULT 0,
  funding_goal DECIMAL(10,2) NOT NULL,
  funding_raised DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_path VARCHAR(150) NOT NULL,
  latitude DECIMAL(9,6) NOT NULL DEFAULT -33.891500,
  longitude DECIMAL(9,6) NOT NULL DEFAULT 151.276700,
  status ENUM('active', 'past', 'suspended') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_events_organization FOREIGN KEY (organization_id)
    REFERENCES organizations(organization_id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id)
    REFERENCES categories(category_id),
  INDEX idx_events_date_status (status, event_date),
  INDEX idx_events_suburb (suburb)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO organizations VALUES
(1, 'Driftline', 'A Sydney community group that organises beach clean-ups, rockpool surveys and planting days.', 'hello@driftline.example', 'Sydney'),
(2, 'Driftline Field Team', 'Volunteers who coordinate planting and field survey sessions in Sydney.', 'field@driftline.example', 'Sydney')
ON DUPLICATE KEY UPDATE summary=VALUES(summary);

INSERT IGNORE INTO categories VALUES
(1, 'Beach clean-up', 'beach-cleanup'),
(2, 'Coastal restoration', 'coastal-restoration'),
(3, 'Citizen science', 'citizen-science'),
(4, 'Community gathering', 'community-gathering');

INSERT INTO events
(event_id,organization_id,category_id,name,summary,description,purpose,location_name,suburb,event_date,start_time,end_time,meeting_point,ticket_price,funding_goal,funding_raised,image_path,status) VALUES
(1,1,1,'North Bondi Beach Clean-up','Collect litter along the north end of Bondi before the beach gets busy.','Start with a safety briefing at North Bondi, then work in small groups toward the promenade. We will collect and sort litter along the way. Gloves and bags are provided. Wear closed shoes and bring a refillable water bottle. Children are welcome with an adult.','Remove small plastics and fishing line before they reach the water.','Bondi Beach','Bondi',DATE_ADD(CURDATE(), INTERVAL 3 DAY),'07:30:00','10:00:00','North Bondi Surf Life Saving Club entrance',0,1800,680,'assets/images/hero-coast.jpg','active'),
(2,1,3,'Rockpool Watch: Coogee','Record species in Coogee rockpools at low tide.','Join a guided rockpool survey at low tide. You will learn how to record common intertidal species and photograph observations without moving animals or disturbing habitat. No science experience is needed. Sturdy shoes with grip are recommended; the route includes uneven rock.','Build a community record of intertidal life and changing conditions.','Coogee Rock Pools','Coogee',DATE_ADD(CURDATE(), INTERVAL 7 DAY),'08:00:00','10:30:00','Steps beside the southern end of Coogee Beach',8.50,2400,1330,'assets/images/rockpool.jpg','active'),
(3,2,2,'Dune Care at Maroubra','Remove weeds and plant native species behind Maroubra Beach.','Work with local volunteers to weed and plant native coastal species behind the beach. Tools and instructions are supplied. The ground is sandy, and some digging is involved. Bring a hat, water and gardening gloves if you have them.','Restore native dune habitat and reduce erosion along the beach edge.','Maroubra Beach Dunes','Maroubra',DATE_ADD(CURDATE(), INTERVAL 12 DAY),'09:00:00','12:00:00','South Maroubra Surf Life Saving Club',0,3200,980,'assets/images/dune-grass.jpg','active'),
(4,1,1,'Blackwattle Bay Clean-up','Collect and sort shoreline litter around Blackwattle Bay.','We will collect litter from accessible paths and the shoreline around Blackwattle Bay. A team leader will explain safe collection and sorting before the group sets out. No one will enter the water. Equipment is supplied and beginners are welcome.','Stop urban litter from entering Sydney Harbour.','Blackwattle Bay','Glebe',DATE_ADD(CURDATE(), INTERVAL 18 DAY),'08:30:00','11:00:00','Glebe Foreshore walk, near Jubilee Park',0,1500,510,'assets/images/cliffs.jpg','active'),
(5,2,4,'Shelly Beach Volunteer Lunch','Meet local volunteers over lunch after a short shoreline walk.','An informal community lunch after a short shoreline walk. Meet neighbours, hear from local volunteers and learn how to join future field days. Tickets are $15; proceeds support gloves, bags and native plants. Bring your own lunch or pick something up nearby.','Bring new coastal volunteers together and fund practical field supplies.','Shelly Beach Reserve','Manly',DATE_ADD(CURDATE(), INTERVAL 26 DAY),'11:00:00','14:00:00','Picnic tables near the Shelly Beach car park',15.00,900,390,'assets/images/shore-texture.jpg','active'),
(6,1,3,'Plastic Count: Bronte','Count and collect small plastics along Bronte Beach.','Help record small pieces of plastic found on the beach using a simple survey method. We will compare samples from different points along the strand line, then remove what we find. The session includes an introduction, field work and a shared count at the end.','Measure and remove small plastics while building a local evidence base.','Bronte Beach','Bronte',DATE_ADD(CURDATE(), INTERVAL 34 DAY),'07:45:00','10:15:00','North end of Bronte Beach, beside the steps',0,1200,730,'assets/images/shore-texture.jpg','active'),
(7,2,2,'Little Bay Planting Day','Plant native coastal species along the Little Bay coast walk.','Spend the morning planting local coastal species with the field team. They will explain why the plants matter, how to protect the seedlings and how they are cared for afterwards. Tools and seedlings are provided. Wear sturdy shoes and sun protection.','Strengthen native vegetation along an exposed coastal corridor.','Little Bay Coast Walk','Little Bay',DATE_ADD(CURDATE(), INTERVAL 42 DAY),'09:00:00','12:30:00','Little Bay Beach upper entrance',0,2800,1175,'assets/images/dune-grass.jpg','active'),
(8,1,1,'North Cronulla Beach Clean-up','Remove and record litter on North Cronulla Beach.','Walk the strand line with a volunteer guide, collecting litter before the next high tide. We will sort what we find, record common items and talk about where they may have come from. Bags, gloves and pickers are provided.','Clear marine debris and learn what washes onto the shore.','North Cronulla Beach','Cronulla',DATE_ADD(CURDATE(), INTERVAL 50 DAY),'09:30:00','12:00:00','North Cronulla Surf Life Saving Club',0,2000,1240,'assets/images/hero-coast.jpg','active'),
(9,1,4,'Paused planning session','This listing is deliberately unavailable.','This planning session has been suspended and should not appear in public results.','Internal planning.','City Hall','Sydney',DATE_ADD(CURDATE(), INTERVAL 20 DAY),'10:00:00','11:00:00','City Hall',0,100,0,'assets/images/shore-texture.jpg','suspended');


-- A past event stays visible to staff but cannot take public bookings.
INSERT INTO events
(event_id,organization_id,category_id,name,summary,description,purpose,location_name,suburb,event_date,start_time,end_time,meeting_point,ticket_price,funding_goal,funding_raised,image_path,status) VALUES
(10,1,1,'Completed Bondi Beach Clean-up','A completed beach clean-up.','Volunteers collected litter along the shoreline. This record is kept for staff.','Keep a record of completed field days.','Bondi Beach','Bondi',DATE_SUB(CURDATE(),INTERVAL 7 DAY),'07:30:00','10:00:00','North Bondi Surf Life Saving Club entrance',0,1000,430,'assets/images/cleanup.jpg','past');

UPDATE events SET latitude = CASE event_id WHEN 2 THEN -33.9200 WHEN 3 THEN -33.9500 WHEN 4 THEN -33.8720 WHEN 5 THEN -33.8006 WHEN 6 THEN -33.9045 WHEN 7 THEN -33.9786 WHEN 8 THEN -34.0500 ELSE -33.8915 END,
longitude = CASE event_id WHEN 2 THEN 151.2580 WHEN 3 THEN 151.2550 WHEN 4 THEN 151.1810 WHEN 5 THEN 151.2980 WHEN 6 THEN 151.2680 WHEN 7 THEN 151.2510 WHEN 8 THEN 151.1550 ELSE 151.2767 END;

CREATE TABLE registrations (
  registration_id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tickets INT NOT NULL,
  ticket_price DECIMAL(8,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT,
  CONSTRAINT uq_registration_event_email UNIQUE (event_id, email),
  -- MySQL 5.7 does not support named CHECK constraints; the API validates these fields.
  -- MySQL 8.0.16+ also enforces them in the database.
  /*!80016 CONSTRAINT ck_registration_tickets CHECK (tickets BETWEEN 1 AND 20), */
  /*!80016 CONSTRAINT ck_registration_price CHECK (ticket_price >= 0 AND total_amount >= 0), */
  INDEX idx_registrations_latest (event_id, registered_at, registration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fictional teaching data; no real contact information is included.
INSERT INTO registrations (event_id,full_name,email,phone,registered_at,tickets,ticket_price,total_amount) VALUES
(1,'Alex Morgan','alex.morgan@example.com','0400 000 101',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 DAY),2,0,0),
(1,'Sam Lee','sam.lee@example.com','0400 000 102',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY),1,0,0),
(1,'Casey Tran','casey.tran@example.com','0400 000 103',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY),3,0,0),
(2,'Jordan Bell','jordan.bell@example.com','0400 000 104',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 DAY),2,8.50,17.00),
(2,'Taylor Wong','taylor.wong@example.com','0400 000 105',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 DAY),1,8.50,8.50),
(3,'Morgan Patel','morgan.patel@example.com','0400 000 106',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 DAY),2,0,0),
(4,'Riley Adams','riley.adams@example.com','0400 000 107',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 DAY),1,0,0),
(5,'Jamie Chen','jamie.chen@example.com','0400 000 108',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY),2,15.00,30.00),
(6,'Chris Nguyen','chris.nguyen@example.com','0400 000 109',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY),1,0,0),
(7,'Alex Morgan','alex.morgan@example.com','0400 000 101',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY),2,0,0),
(10,'Sam Lee','sam.lee@example.com','0400 000 102',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 8 DAY),1,0,0),
(2,'Avery Scott','avery.scott@example.com','0400 000 110',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 HOUR),3,8.50,25.50);
