import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BanquetCard } from "@/components/ui/BanquetCard";
import { QuoteForm } from "@/components/ui/QuoteForm";
import { ImageSelector } from "@/components/ui/ImageSelector";
import { generateQuotationPDF, generateGalleryPDF } from "@/utils/pdfGenerator";
import { Search, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Banquet {
  id: string;
  name: string;
  city: string;
  capacity: number;
  basePrice: number;
}

interface Service {
  description: string;
  pax: number;
  price: number;
}

interface QuoteData {
  clientName: string;
  eventDate: string;
  services: Service[];
  notes: string;
}

const BANQUETS: Banquet[] = [
  // Jaipur Venues
  { id: "2", name: "Rambagh Palace (Taj)", city: "Rambagh Palace, Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005", capacity: 500, basePrice: 1000 },
  { id: "3", name: "Jai Mahal Palace", city: "Jai Mahal Palace, Jacob Rd, Civil Lines, Jaipur, Rajasthan 302006", capacity: 500, basePrice: 1000 },
  { id: "4", name: "Rajmahal Palace RAAS Jaipur", city: "Rajmahal Palace, Sardar Patel Marg, C-Scheme, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "5", name: "Narain Niwas Palace", city: "Hotel Narain Niwas Palace, Kanota Bagh, Narain Singh Rd, Jaipur, Rajasthan 302004", capacity: 500, basePrice: 1000 },
  { id: "6", name: "Alsisar Haveli", city: "Alsisar Haveli, Sansar Chandra Rd, Sindhi Camp, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "7", name: "Shahpura House", city: "Shahpura House, D-257 Devi Marg, Bani Park, Jaipur, Rajasthan 302016", capacity: 500, basePrice: 1000 },
  { id: "8", name: "Diggi Palace", city: "Diggi Palace, Shivaji Marg, C-Scheme, Jaipur, Rajasthan 302004", capacity: 500, basePrice: 1000 },
  { id: "9", name: "Samode Palace", city: "Samode Palace, Village Samode, Tehsil Chomu, District Jaipur, Rajasthan 303806", capacity: 500, basePrice: 1000 },
  { id: "10", name: "Samode Haveli", city: "Samode Haveli, Jorawar Singh Gate, Gangapole, Jaipur, Rajasthan 302002", capacity: 500, basePrice: 1000 },
  { id: "11", name: "Chomu Palace", city: "Chomu Palace, Chomu, Jaipur, Rajasthan 303702", capacity: 500, basePrice: 1000 },
  { id: "12", name: "Royal Heritage Haveli", city: "Royal Heritage Haveli, Khatipura Tiraya, Khatipura Rd, Jaipur, Rajasthan 302012", capacity: 500, basePrice: 1000 },
  { id: "13", name: "The Oberoi Rajvilas", city: "The Oberoi Rajvilas, Babaji Ka Modh, Goner Rd, Jaipur, Rajasthan 302031", capacity: 500, basePrice: 1000 },
  { id: "14", name: "Trident Jaipur", city: "Trident Jaipur, Amber Fort Rd, Opposite Jai Mahal, Jaipur, Rajasthan 302002", capacity: 500, basePrice: 1000 },
  { id: "15", name: "The Leela Palace Jaipur", city: "The Leela Palace Jaipur, Jaipur-Delhi Highway, NH 11, Kukas, Jaipur, Rajasthan 302038", capacity: 500, basePrice: 1000 },
  { id: "16", name: "Fairmont Jaipur", city: "Fairmont Jaipur, 2, Riico, Kukas, Jaipur, Rajasthan 302038", capacity: 500, basePrice: 1000 },
  { id: "17", name: "JW Marriott Jaipur Resort & Spa", city: "JW Marriott Jaipur Resort & Spa, Jaipur-Delhi Highway, Khasra Nos. 122-124, 138, 140-141, Kukas, Jaipur, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "18", name: "Le Méridien Resort & Spa", city: "Le Méridien Jaipur Resort & Spa, RIICO, Kukas, Jaipur, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "19", name: "Raffles Jaipur", city: "Raffles Jaipur, Khasra Nos. 2060-2061/2267, Tehsil Amer, Kukas, Jaipur, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "20", name: "Rajputana Resort & Spa", city: "Rajputana Hotel & Spa, Plot No. 1, Gopalbari, Jaipur, Rajasthan 302006", capacity: 500, basePrice: 1000 },
  { id: "21", name: "Taj Rajputana, a Luxury Collection Hotel", city: "Taj Rajputana, a Luxury Collection Hotel, Gopalbari, Jaipur, Rajasthan 302006", capacity: 500, basePrice: 1000 },
  { id: "22", name: "Jaipur Marriott Hotel", city: "Jaipur Marriott Hotel, Ashram Marg, Near Jawahar Circle, Jaipur, Rajasthan 302015", capacity: 500, basePrice: 1000 },
  { id: "23", name: "The LaLiT Jaipur", city: "The LaLiT Jaipur, 2B & 2C, Jagatpura Rd, Near Jawahar Circle, Jaipur, Rajasthan 302017", capacity: 500, basePrice: 1000 },
  { id: "24", name: "Hilton Jaipur", city: "Hilton Jaipur, 42 Geejgarh House, Hawa Sadak, Jaipur, Rajasthan 302006", capacity: 500, basePrice: 1000 },
  { id: "25", name: "Radisson Blu Jaipur", city: "Radisson Blu Jaipur, Plot No. 5 & 6, Airport Plaza, Tonk Rd, Durgapura, Jaipur, Rajasthan 302018", capacity: 500, basePrice: 1000 },
  { id: "26", name: "Radisson Jaipur City Center", city: "Radisson Jaipur City Center, Khasa Kothri Cir, Mirza Ismail Rd, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "27", name: "Holiday Inn Jaipur City Centre", city: "Holiday Inn Jaipur City Centre, Commercial Plot No. 1, Sardar Patel Marg, Bais Godam, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "28", name: "Crowne Plaza Jaipur Tonk Road", city: "Crowne Plaza Jaipur Tonk Road, Tonk Rd, Sitapura Industrial Area, Jaipur, Rajasthan 302022", capacity: 500, basePrice: 1000 },
  { id: "29", name: "Clarks Amer", city: "Clarks Amer, Jawahar Lal Nehru Marg, Opp. Fortis Escorts Hospital, Lal Bahadur Nagar, Durgapura, Jaipur, Rajasthan 302018", capacity: 500, basePrice: 1000 },
  { id: "30", name: "Jaipur Exhibition & Convention Center (JECC)", city: "JECC, EPIP, Sitapura Industrial Area, Sitapura, Jaipur, Rajasthan 302022", capacity: 500, basePrice: 1000 },
  { id: "31", name: "M. R. Meridia Auditorium & Convention Centre", city: "M. R. Meridia Auditorium, Station Circle, C-Scheme, Ashok Nagar, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "32", name: "Hotel Diggi Palace Lawns", city: "Diggi Palace Lawns, Shivaji Marg, C Scheme, Jaipur, Rajasthan 302004", capacity: 500, basePrice: 1000 },
  { id: "33", name: "Jai Bagh Palace", city: "Jai Bagh Palace, NH-8, Village Kunda, Amer, Kukas, Jaipur, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "34", name: "Taj Amer (Devi Ratn - IHCL Selections)", city: "Devi Ratn, IHCL Selections, Jhalana Chhod, Ballupura Farms, Agra Rd, Ghati Karolain, Jaipur, Rajasthan 302031", capacity: 500, basePrice: 1000 },
  { id: "35", name: "The Raj Palace", city: "The Raj Palace, Jorawar Singh Gate, Amer Rd, Chokdi Gangapol, Jaipur, Rajasthan 302002", capacity: 500, basePrice: 1000 },
  { id: "36", name: "Alila Fort Bishangarh", city: "Manoharpur - Bishangarh Link Rd, off NH-8, At Bishangarh, Rajasthan 303104", capacity: 500, basePrice: 1000 },
  { id: "37", name: "Mundota Fort & Palace", city: "Mundota Rd, Mundota, Rajasthan 303706", capacity: 500, basePrice: 1000 },
  { id: "38", name: "Jal Mahal Palace", city: "D-257, Devi Marg, Bani Park, Jaipur, Rajasthan 302016", capacity: 500, basePrice: 1000 },
  { id: "39", name: "Narain Niwas Palace Hotel", city: "Hotel Narain Niwas Palace, Kanota Bagh, Narayan Singh Rd, Rambagh, Jaipur, Rajasthan 302004", capacity: 500, basePrice: 1000 },
  { id: "40", name: "Jaigarh Fort", city: "Devisinghpura, Amer, Jaipur, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "41", name: "Shiv Vilas Resort", city: "Delhi - Jaipur Expy, Kukas, Shiv Vilas Resort, Jaipur, Kookas, Rajasthan 303101", capacity: 500, basePrice: 1000 },
  { id: "42", name: "The Gold Palace & Resorts", city: "8th Mile, Jaipur Road, Jaipur, Kookas, Rajasthan 302038", capacity: 500, basePrice: 1000 },
  { id: "43", name: "Umaid Palace - A Lakeside Heritage Palace Resort", city: "Kalakho, Post Office Kalakho Dist. Dausa, Jaipur Agra, National Highway, Area, Kalakho, Kandoli, Rajasthan 303304", capacity: 500, basePrice: 1000 },
  { id: "44", name: "Alsisar Haveli", city: "Sansar Chandra Rd, Shri Ram Colony, Sindhi Camp, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "45", name: "Pride Amber Vilas", city: "Vatika Mod, 12 Mile, Tonk Rd, Sitapura Industrial Area, Sitapura, Jaipur, Rajasthan 303905", capacity: 500, basePrice: 1000 },
  { id: "46", name: "Lohagarh Fort Resort", city: "LOHAGARH FORT RESORT, Rajasthan 303805", capacity: 500, basePrice: 1000 },
  { id: "47", name: "Taj Devi Ratna Resort", city: "Ballupura Farms, No. 8 & 9, Agra Road, Jamdoli, Balloopura, Jaipur, Rajasthan 302031", capacity: 500, basePrice: 1000 },
  { id: "48", name: "Roop Garh Palace", city: "250 Meters from NH11, opposite Amity University, Jaipur, Chak Charanwas, Rajasthan 303002", capacity: 500, basePrice: 1000 },
  { id: "49", name: "Bhanwar Singh Palace Jaipur", city: "opposite Solitaire Industrial Park, Bagru, Rajasthan 303007", capacity: 500, basePrice: 1000 },
  { id: "50", name: "Club Mahindra Resort", city: "Golimar Garden, Plot no.1, Amer Rd, near Ramgarh Mod, Kagdiwara, Brahampuri, Jaipur, Rajasthan 302002", capacity: 500, basePrice: 1000 },
  { id: "51", name: "Indian Palace", city: "Sardar Patel Marg, Shivaji Nagar, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "52", name: "momentus by ITC", city: "Khasra No. 66, near Kukas, Natata, Amer Chak No.2, Rajasthan 302028", capacity: 500, basePrice: 1000 },
  { id: "53", name: "Fort Chandra Gupta", city: "Station Rd, Near Central Bus Stand, Kanti Nagar, Sindhi Camp, Jaipur, Rajasthan 302001", capacity: 500, basePrice: 1000 },
  { id: "54", name: "Labh Garh Palace", city: "Cheerwa Ghats, Eklingji Road, National Highway 8, Udaipur, Sare, Rajasthan 313202", capacity: 500, basePrice: 1000 },

  // Goa Venues
  { id: "55", name: "W Goa", city: "Vagator Beach, Bardez, Goa, Anjuna, Goa 403509", capacity: 500, basePrice: 1000 },
  { id: "56", name: "Goa Marriott Resort & Spa", city: "Post Box, No. 64, Miramar, Goa, Panaji, Goa 403001", capacity: 500, basePrice: 1000 },
  { id: "57", name: "Park Regis Goa", city: "Saqwadi,, Arpora, Goa 403509", capacity: 500, basePrice: 1000 },
  { id: "58", name: "The LaLiT Golf & Spa Resort Goa", city: "Raj Baga, Palolem, Canacona, Goa 403702", capacity: 500, basePrice: 1000 },
  { id: "59", name: "Resort Rio", city: "Near Baga Beach Tambudki, Arpora, Goa 403518", capacity: 500, basePrice: 1000 },
  { id: "60", name: "Alila Diwa Goa", city: "48/10, Adao Waddo, Pacheco Vaddo, Majorda, Goa 403713", capacity: 500, basePrice: 1000 },
  { id: "61", name: "Grand Hyatt Goa", city: "P.O, Goa University, Aldeia de Goa, Bambolim, Goa 403206", capacity: 500, basePrice: 1000 },
  { id: "62", name: "The Zuri White Sands, Goa Resort & Casino", city: "Pedda, Varca, Fatrade, Goa 403721", capacity: 500, basePrice: 1000 },
  { id: "63", name: "Planet Hollywood Beach Resort", city: "30/3, Ascona Waddo, Uttorda Beach, Utorda, Goa 403713", capacity: 500, basePrice: 1000 },
  { id: "64", name: "Novotel Goa Resort & Spa", city: "Pinto Waddo, off Candolim Road, Candolim, Goa 403515", capacity: 500, basePrice: 1000 },
  { id: "65", name: "Taj Exotica Resort & Spa", city: "No address found", capacity: 500, basePrice: 1000 },
  { id: "66", name: "The Leela Goa", city: "Mobor, Cavelossim, Goa, Velim, Goa 403731", capacity: 500, basePrice: 1000 },
  { id: "67", name: "Le Méridien Goa Calangute", city: "Aguada - Siolim Rd, Gauravaddo, Calangute, Goa 403516", capacity: 500, basePrice: 1000 },
  { id: "68", name: "Taj Cidade de Goa Heritage", city: "Dona Paula, Vainguinim Beach, Panaji, Durgavado, Goa 403004", capacity: 500, basePrice: 1000 },
  { id: "69", name: "ITC Grand Goa, a Luxury Collection Resort & Spa", city: "Arossim Beach Rd, Arossim, Goa 403712", capacity: 500, basePrice: 1000 },
  { id: "70", name: "The St. Regis Goa Resort", city: "Mobor, Cavelossim, Goa, Velim, Goa 403731", capacity: 500, basePrice: 1000 },
  { id: "71", name: "Azaya Beach Resort", city: "336/0, Village Calwaddo, Benaulim, Goa 403716", capacity: 500, basePrice: 1000 },
  { id: "72", name: "The Westin Goa", city: "Survey No 204/1, Sub Division 1, Bardez, Dmello Waddo, Anjuna, Goa, 403509", capacity: 500, basePrice: 1000 },
  { id: "73", name: "Taj Fort Aguada Resort & Spa", city: "Beach, Sinquerim, Candolim, Goa 403515", capacity: 500, basePrice: 1000 },
  { id: "74", name: "Hyatt Centric Candolim Goa", city: "Anna Waddo, Main, Candolim Rd, Gaurawaddo, Candolim, Goa 403515", capacity: 500, basePrice: 1000 },
  { id: "75", name: "Taj Holiday Village Resort & Spa", city: "Nerul - Candolim Rd, Sinquerim, Candolim, Goa 403515", capacity: 500, basePrice: 1000 },
  { id: "76", name: "Royal Orchid Beach Resort & Spa", city: "Utor da Beach Rd, Utorda, Goa 403713", capacity: 500, basePrice: 1000 },
  { id: "77", name: "Cidade de Goa Heritage", city: "Dona Paula, Vainguinim Beach, Panaji, Durgavado, Goa 403004", capacity: 500, basePrice: 1000 },
  { id: "78", name: "Holiday Inn Resort Goa", city: "Beach, Cavelossim, Mobor Beach, Goa 403731", capacity: 500, basePrice: 1000 },
  { id: "79", name: "Radisson Blu Resort Goa Cavelossim Beach", city: "Beach, Varca, Salcete, Goa 403717", capacity: 500, basePrice: 1000 },
  { id: "80", name: "Caravela Beach Resort", city: "9RP9+C58 Resort, Bogmalo Road, Bogmalo, Goa 403806", capacity: 500, basePrice: 1000 },
  { id: "81", name: "Bogmallo Beach Resort", city: "370/14, Bishop Alex Dias Rd, Porba Vaddo, Bardez, Calangute, Goa 403516", capacity: 500, basePrice: 1000 },
  { id: "82", name: "Hard Rock Hotel Goa", city: "Utorda, Goa 403713", capacity: 500, basePrice: 1000 },
  { id: "83", name: "The O Hotel Beach Resort and Spa", city: "—", capacity: 500, basePrice: 1000 },
  { id: "84", name: "Kenilworth Resort & Spa", city: "—", capacity: 500, basePrice: 1000 },
  { id: "85", name: "DoubleTree by Hilton Goa - Arpora - Baga", city: "—", capacity: 500, basePrice: 1000 },
  { id: "86", name: "Rio Resort", city: "—", capacity: 500, basePrice: 1000 },
  { id: "87", name: "Planet Hollywood Beach Resort", city: "—", capacity: 500, basePrice: 1000 },
  { id: "88", name: "The Leela Goa", city: "Ximer, Arpora, Goa 403518", capacity: 500, basePrice: 1000 },

  // Delhi & NCR Venues
  { id: "89", name: "The Oberoi, New Delhi", city: "Dr. Zakir Hussain Marg", capacity: 500, basePrice: 1000 },
  { id: "90", name: "Taj Palace, New Delhi", city: "Diplomatic Enclave", capacity: 500, basePrice: 1000 },
  { id: "91", name: "ITC Maurya, a Luxury Collection Hotel, New Delhi", city: "Diplomatic Enclave, Chanakyapuri", capacity: 500, basePrice: 1000 },
  { id: "92", name: "The Oberoi, New Delhi", city: "Diplomatic Enclave, Chanakyapuri", capacity: 500, basePrice: 1000 },
  { id: "93", name: "Shangri-La Eros New Delhi", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "94", name: "The Imperial New Delhi", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "95", name: "JW Marriott Hotel New Delhi Aerocity", city: "Aerocity", capacity: 500, basePrice: 1000 },
  { id: "96", name: "Hyatt Regency Delhi", city: "Bhikaji Cama Place, Ring Road", capacity: 500, basePrice: 1000 },
  { id: "97", name: "The Lodhi, New Delhi", city: "Lodhi Road", capacity: 500, basePrice: 1000 },
  { id: "98", name: "Radisson Blu Plaza Hotel, New Delhi Aerocity", city: "Mahipalpur", capacity: 500, basePrice: 1000 },
  { id: "99", name: "The LaLiT New Delhi", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "100", name: "Roseate House, New Delhi", city: "Aerocity", capacity: 500, basePrice: 1000 },
  { id: "101", name: "Andaz Delhi, by Hyatt", city: "Aerocity", capacity: 500, basePrice: 1000 },
  { id: "102", name: "The Grand New Delhi", city: "Vasant Kunj", capacity: 500, basePrice: 1000 },
  { id: "103", name: "Welcomhotel by ITC Hotels, Dwarka, New Delhi", city: "Sector 10 Dwarka", capacity: 500, basePrice: 1000 },
  { id: "104", name: "Lemon Tree Premier Delhi Airport", city: "Aerocity", capacity: 500, basePrice: 1000 },
  { id: "105", name: "Radisson Blu Hotel New Delhi Paschim Vihar", city: "Paschim Vihar", capacity: 500, basePrice: 1000 },
  { id: "106", name: "Novotel New Delhi Aerocity", city: "Aerocity", capacity: 500, basePrice: 1000 },
  { id: "107", name: "Hyatt Centric Janakpuri, New Delhi", city: "Janakpuri", capacity: 500, basePrice: 1000 },
  { id: "108", name: "The Park New Delhi", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "109", name: "Radisson Blu Marina Hotel Connaught Place", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "110", name: "Novotel New Delhi City Centre", city: "Jhandewalan", capacity: 500, basePrice: 1000 },
  { id: "111", name: "The Metropolitan Hotel and Spa", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "112", name: "Maidens Hotel", city: "North Delhi", capacity: 500, basePrice: 1000 },
  { id: "113", name: "Jaypee Siddharth Hotel", city: "Rajendra Place", capacity: 500, basePrice: 1000 },
  { id: "114", name: "Le Meridien Delhi", city: "Connaught Place", capacity: 500, basePrice: 1000 },
  { id: "115", name: "Seven Seas Hotel", city: "12, M2K Rd, Mangalam Place, Rohini, New Delhi, Delhi, 110085", capacity: 500, basePrice: 1000 },
  { id: "116", name: "Radisson Blu Hotel Kaushambi Delhi NCR", city: "Moidporn Vihar, Sector 14, Kaushambi, Ghaziabad, Uttar Pradesh 201010", capacity: 500, basePrice: 1000 },
  { id: "117", name: "Hotel Prince Palace Deluxe", city: "5115, Gali Thanedar, behind Sushant Travels private limited, Bharat Nagar, Paharganj, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "118", name: "Hotel Mayda Inn- A Boutique Hotel By Mayda Hospitality Pvt. Ltd.", city: "Dr Zakir Hussain Marg, Delhi Golf Club, Golf Links, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "119", name: "Hotel Sunstar Grand", city: "7A/17, Channa Market, Channa Market, Block 7A, WEA, Karol Bagh, Delh", capacity: 500, basePrice: 1000 },
  { id: "120", name: "Hotel Sun International", city: "5115, Gali Thanedar, behind Sushant Travels private limited, Bharat Nagar, Paharganj, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "121", name: "The Grand Uddhav", city: "253, Street Number 5, A Block, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "122", name: "Hotel Sun International", city: "7A/17, Channa Market, Block 7A, WEA, Karol Bagh, Delhi", capacity: 500, basePrice: 1000 },
  { id: "123", name: "The Grand Uddhav", city: "4953-54, Ramdwara Rd, Bagichi Ramchander, Nehru Bazar, Paharganj, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "124", name: "HOTEL AIRPORT CITY", city: "A-11, Rd Number 1, Block B, Mahipalpur Village, Mahipalpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "125", name: "Airport Hotel Delhi", city: "Indira Gandhi International Airport, Terminal 1, Opp, Domestic, Mehram Nagar, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "126", name: "Centaur Hotel New Delhi Airport", city: "IGI Airport T3 Road, near Indira Gandhi International Airport, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "127", name: "ibis New Delhi Aerocity", city: "IGI Rd, Aerocity, Ibis, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "128", name: "De Pavilion Hotel, Delhi", city: "250-A, Road No. 6, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "129", name: "Radisson Hotel Noida", city: "NOIDA SECTOR 55", capacity: 500, basePrice: 1000 },
  { id: "130", name: "Crown PLaza Noida", city: "Chowk Institutional Green, Surajpur, Greater Noida", capacity: 500, basePrice: 1000 },
  { id: "131", name: "Vivanta", city: "Dwarka, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "132", name: "DoubleTree By Hilton Gurgaon", city: "Sector 50, Gurgaon", capacity: 500, basePrice: 1000 },
  { id: "133", name: "The Claridges", city: "12, Dr APJ Abdul Kalam Rd,", capacity: 500, basePrice: 1000 },
  { id: "134", name: "Holiday Inn", city: "District Centre, 13A, Mayur Place, Mayur Vihar", capacity: 500, basePrice: 1000 },
  { id: "135", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "136", name: "V Club", city: "Sector 48, Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "137", name: "Casabella Banquet", city: "Sector 48, Sohna Road & Sector 33", capacity: 500, basePrice: 1000 },
  { id: "138", name: "Kosmos Banquet Hall", city: "Sector 64", capacity: 500, basePrice: 1000 },
  { id: "139", name: "The Leela Ambience Gurugram", city: "DLF Phase 3", capacity: 500, basePrice: 1000 },
  { id: "140", name: "Royal Swan Banquet", city: "Sector 33", capacity: 500, basePrice: 1000 },
  { id: "141", name: "The Riviera by FNP Venues", city: "DLF Phase 3", capacity: 500, basePrice: 1000 },
  { id: "142", name: "Green Orchid Farms", city: "Basai", capacity: 500, basePrice: 1000 },
  { id: "143", name: "Leolarch Farms", city: "Bawana", capacity: 500, basePrice: 1000 },
  { id: "144", name: "Wedlock Farm", city: "Sector 72", capacity: 500, basePrice: 1000 },
  { id: "145", name: "Rangmanch Farms", city: "Sachaunra Village", capacity: 500, basePrice: 1000 },
  { id: "146", name: "Shubh Banquets & Convention Centre", city: "Sector 39", capacity: 500, basePrice: 1000 },
  { id: "147", name: "The City Club", city: "Sohna Road, DLF Phase 4", capacity: 500, basePrice: 1000 },
  { id: "148", name: "Leolarch Farms", city: "Badshahpur", capacity: 500, basePrice: 1000 },
  { id: "149", name: "Devam Green by WSG", city: "Baliawas", capacity: 500, basePrice: 1000 },
  { id: "150", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "151", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", capacity: 500, basePrice: 1000 },
  { id: "152", name: "The Rivets by FNP Venues", city: "DLF Phase 3", capacity: 500, basePrice: 1000 },
  { id: "153", name: "The Westin Sohna Resort & Spa", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "154", name: "Karma Lakelands", city: "Sector 80", capacity: 500, basePrice: 1000 },
  { id: "155", name: "GNH Convention", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "156", name: "Walsingham Farms", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "157", name: "Mallu Farms", city: "MG Road", capacity: 500, basePrice: 1000 },
  { id: "158", name: "Jain Farms", city: "Sohna", capacity: 500, basePrice: 1000 },
  { id: "159", name: "The City Club", city: "Sohna Road, DLF Phase 4", capacity: 500, basePrice: 1000 },
  { id: "160", name: "Karma Lakelands", city: "Sector 80, Naurangpur", capacity: 500, basePrice: 1000 },
  { id: "161", name: "The Riviera by FNP Venues", city: "DLF Phase 3", capacity: 500, basePrice: 1000 },
  { id: "162", name: "GNH Convention", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "163", name: "Walsingham Farms", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "164", name: "Mallu Farms", city: "MG Road", capacity: 500, basePrice: 1000 },
  { id: "165", name: "Jain Farms", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "166", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", capacity: 500, basePrice: 1000 },
  { id: "167", name: "The Kesar Bagh", city: "Manesar", capacity: 500, basePrice: 1000 },
  { id: "168", name: "Radha Krishna Garden", city: "Sector 37", capacity: 500, basePrice: 1000 },
  { id: "169", name: "Wedlock Farm", city: "Sector 72", capacity: 500, basePrice: 1000 },
  { id: "170", name: "Bliss Premiere", city: "Sector 83", capacity: 500, basePrice: 1000 },
  { id: "171", name: "Royal Farm", city: "Sector 57", capacity: 500, basePrice: 1000 },
  { id: "172", name: "Tasya Farms", city: "Manesar", capacity: 500, basePrice: 1000 },
  { id: "173", name: "Karma Lakelands", city: "Sector 80", capacity: 500, basePrice: 1000 },
  { id: "174", name: "Botanix Nature Resort", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "175", name: "A Dot by GNH", city: "N/A", capacity: 500, basePrice: 1000 },
  { id: "176", name: "The Kesar Bagh", city: "Manesar", capacity: 500, basePrice: 1000 },
  { id: "177", name: "GNH Convention", city: "Sohna Road", capacity: 500, basePrice: 1000 },
  { id: "178", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", capacity: 500, basePrice: 1000 },
  { id: "179", name: "The Riviera by FNP Venues", city: "DLF City Phase 3", capacity: 500, basePrice: 1000 },
  { id: "180", name: "Limón Hotel and Banquet Hall", city: "B-101 South City 1, Sector 30, Gurgaon", capacity: 500, basePrice: 1000 },
  { id: "181", name: "Holiday Inn", city: "N/A", capacity: 500, basePrice: 1000 },
  { id: "182", name: "Aurum", city: "sector 66 gurugram", capacity: 500, basePrice: 1000 },
  { id: "183", name: "Araya Bagh", city: "Gitorni", capacity: 500, basePrice: 1000 },
  { id: "184", name: "Vivaan by SK", city: "attalm, gurgaon,opp airforce station,gurugram", capacity: 500, basePrice: 1000 },
  { id: "185", name: "Royal Swan Banquet", city: "sector 33 gurugram", capacity: 500, basePrice: 1000 },
  { id: "186", name: "Shubh Banquets & Convention Centre", city: "At atul kataria marg sector 13 gurugram", capacity: 500, basePrice: 1000 },
  { id: "187", name: "Prism ballroom banquet", city: "Sector 2 Faridabad gurgaon", capacity: 500, basePrice: 1000 },
  { id: "188", name: "Umrao", city: "N/A", capacity: 500, basePrice: 1000 },
  { id: "189", name: "Bliss Premiere", city: "Sukhrali enclave sector 17A gurugram", capacity: 500, basePrice: 1000 },
  { id: "190", name: "Taj Damdama", city: "Gurgaon Rd, Damdama, Sohna, Gurgaon", capacity: 500, basePrice: 1000 },
  { id: "191", name: "The Westin Sohna", city: "Vatika Complex PO Dhaula, Karanki", capacity: 500, basePrice: 1000 },
  { id: "192", name: "Taj Surajkund Resort", city: "Shooting Range Road, Block C, Surajkund, Faridabad", capacity: 500, basePrice: 1000 },

  // Jim Corbett Venues
  { id: "193", name: "The Solluna Resort", city: "Marchula, Jim Corbett National Park", capacity: 500, basePrice: 1000 },
  { id: "194", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli", capacity: 500, basePrice: 1000 },
  { id: "195", name: "Namah Resort", city: "Dhikuli Road, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "196", name: "The Den Corbett Resort & Spa", city: "Ranikhet Road, Kumariya", capacity: 500, basePrice: 1000 },
  { id: "197", name: "Jim’s Jungle Retreat", city: "Village & PO Dhela, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "198", name: "The Riverview Retreat", city: "Zero Garjia, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "199", name: "The Hridayesh Spa Wilderness Resort", city: "Near Bijrani Safari Gate", capacity: 500, basePrice: 1000 },
  { id: "200", name: "Aahana The Corbett Wilderness", city: "Village Semal Khalia, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "201", name: "Lemon Tree Premier", city: "Near Corbett National Park", capacity: 500, basePrice: 1000 },
  { id: "202", name: "Amantrum Gateway Resorts", city: "Village: Motipur Negi, Dhela Road", capacity: 500, basePrice: 1000 },
  { id: "203", name: "Tiarara Hotels & Resorts", city: "Ramnagar, Nainital", capacity: 500, basePrice: 1000 },
  { id: "204", name: "Lohagarh Corbett Resort (Lawn 1)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "205", name: "The Golden Tusk (Buzz)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "206", name: "Atulya Resort (Hall)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "207", name: "Nadiya Parao Resort (Hall)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "208", name: "Le Roi Corbett Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "209", name: "The Tiger Groove (Banquet Hall)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "210", name: "Saraca Resort & Spa Corbett", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "211", name: "Fortune Walkway Mall", city: "Haldwani, Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "212", name: "Corbett Fun Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "213", name: "StayVista Villa at Amaltas Ramnagar", city: "Ramnagar, Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "214", name: "Taarini Corbett Camp", city: "Marchula, Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "215", name: "The Den Corbett Resort & Spa", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "216", name: "Winsome Resorts and Spa", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "217", name: "Taj Corbett Resort & Spa, Uttarakhand (Board Room)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "218", name: "Taj Corbett Resort & Spa, Uttarakhand (Woods)", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "219", name: "The Tattwaa Corbett Spa & Resort (Ark)", city: "Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "220", name: "Tarangi Hotels & Resorts", city: "Ramnagar, Nainital", capacity: 500, basePrice: 1000 },
  { id: "221", name: "The Baakhli Corbett", city: "Choi, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "222", name: "Lohagarh Corbett Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "223", name: "The Golden Tusk", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "224", name: "Atulya Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "225", name: "Nadiya Parao Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "226", name: "Le Roi Corbett Resort", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "227", name: "The Tiger Groove", city: "Jim Corbett", capacity: 500, basePrice: 1000 },
  { id: "228", name: "Corbett View Resort", city: "Village Dhela, Ramnagar", capacity: 500, basePrice: 1000 },
  { id: "229", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli", capacity: 500, basePrice: 1000 },
  { id: "230", name: "The Tattwaa Corbett Spa & Resort", city: "Himmatpur Dotiyal, Jhirna Road, Ramnagar, Uttarakhand", capacity: 500, basePrice: 1000 },

  // Rishikesh Venues
  { id: "231", name: "Taj Rishikesh Resort & Spa", city: "Village Singthali, Tehri Garhwal", capacity: 500, basePrice: 1000 },
  { id: "232", name: "Aloha on the Ganges", city: "National Highway 7, 58, Rishikesh, Tapovan", capacity: 500, basePrice: 1000 },
  { id: "233", name: "Ganga Kinare - A Riverside Boutique Hotel", city: "237 Virbhadra Rd, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "234", name: "The Divine Resort & Spa", city: "Tapovan Laxman Jhula, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "235", name: "The Westin Resort & Spa", city: "Village Gaurd Chatti, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "236", name: "Namami Ganges Resort & SPA", city: "Shyampur, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "237", name: "Shaantam Resort & Spa", city: "Neelkanth Mandir Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "238", name: "The Palms Resort", city: "Haridwar - Rishikesh Road, NH 58, Raiwala", capacity: 500, basePrice: 1000 },
  { id: "239", name: "Summit By The Ganges Resort & Spa", city: "Village Singthali, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "240", name: "The Roseate Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "241", name: "The Forest View Hotel", city: "Dehradun Road, near BSNL Office, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "242", name: "Camp Brook by CampingAie", city: "Village Ghatghat, Neelkanth Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "243", name: "Zana by The Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "244", name: "The Grand Shiva Resort & Spa", city: "Tapovan, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "245", name: "The Bhandari Palace", city: "Khand Gaon Laal Pani, Near New Arto Office, Bypass Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "246", name: "Neelkanth Wedding Point", city: "Gunwaliam, Shyampur, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "247", name: "Sai Garden", city: "Raiwala, Haripur Kalan, Haridwar Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "248", name: "The Narayana Palace by Salvus", city: "Near Bajari, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "249", name: "Hotel Natraj", city: "Dehradun Road, Natraj Chowk, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "250", name: "Samsara River Resort", city: "Haridwar Highway, Ghatghat, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "251", name: "Midway Resort", city: "Haridwar-Rishikesh Road, Raiwala", capacity: 500, basePrice: 1000 },
  { id: "252", name: "Raj Resort", city: "Badrinath Road, Near Laxman Jhula, Tapovan", capacity: 500, basePrice: 1000 },
  { id: "253", name: "Him River Resort", city: "Near Phoolchatti Ashram, Neelkanth Mandir Road", capacity: 500, basePrice: 1000 },
  { id: "254", name: "Royale Rainbow Resort", city: "Palliayl Gaon, Neelkanth Mandir Road", capacity: 500, basePrice: 1000 },
  { id: "255", name: "Antaram Resort", city: "Ghattughat, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "256", name: "Simply Heaven Rishikesh", city: "Neelkanth Temple Road, Maral, Near Phoolchatti Ashram", capacity: 500, basePrice: 1000 },
  { id: "257", name: "The Neeraj Naturecure", city: "Village, Tapovan, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "258", name: "juSTA Rasa", city: "Syali, Shyampur, Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "259", name: "Mahayana Resort", city: "Ratapani, Neelkanth Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "260", name: "Hotel Shivganga Retreat", city: "Virbhadra, Near All India Radio, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "261", name: "The Grand Shiva Resort & Spa", city: "Badrinath Road, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "262", name: "Creek Forest - Riverside Boutique Resort", city: "Ghattu Ghat, Neelkanth Temple Rd, Rishikesh, Uttarakhand", capacity: 500, basePrice: 1000 },
  { id: "263", name: "Moushtache Rishikesh Riverside Resort", city: "near Jumpin Heights, Jogiana Pul, Mohan Chatti, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "264", name: "Samsara River Resort by H2O", city: "355, Haridwar Rd, Palika Nagar, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "265", name: "Hotel EliBee Ganga", city: "Gram Jogiyana, Neelkanth Temple Rd, Mohan Chatti, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "266", name: "River Valley Resort Rishikesh", city: "Cheela Dam - Rishikesh Rd, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "267", name: "The Neeraj River Forest Resort", city: "10B, Bees Bigha Main Rd, Bapu Gram, IDPL Colony, Veerbhadra, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "268", name: "Semaity'S Palace", city: "Mohan Chatti, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "269", name: "juSTA Rasa Retreat & Spa", city: "Milestone 30, Badrinath Rd, Rishikesh, Singtali", capacity: 500, basePrice: 1000 },
  { id: "270", name: "Atali Ganga", city: "Village, Ghattughat, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "271", name: "Ekantam Riverside Resort", city: "near 23rd Milestone, Badrinath Rd, Gular Dogi, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "272", name: "Anand Kashi by the Ganges", city: "Sheesham Jhari, near Purnanda Inter College, Muni Ki Reti, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "273", name: "Hotel Rishikesh Grand", city: "48JF+PGH, Badrinath Rd, Tapovan, Rishikesh", capacity: 500, basePrice: 1000 },
  { id: "274", name: "Indira Nikunj Rubystone Exotic", city: "Unit No.46, Sivananda Ashram Rd, Shisham Jhari, Muni Ki Reti, Rishikesh", capacity: 500, basePrice: 1000 },

  // Farmhouse & other NCR Venues
  { id: "275", name: "The Riviera by FNP Venues", city: "Ambience Island, Gurugram (NCR)", capacity: 500, basePrice: 1000 },
  { id: "276", name: "The Kundan Farms", city: "Kapashera Estate Road, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "277", name: "Shagun Farm", city: "Gadaipur Bandh Road, Chattarpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "278", name: "The Manor Farmhouse", city: "Friends Colony, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "279", name: "GNH Convention", city: "Sohna Road, Gurugram (NCR)", capacity: 500, basePrice: 1000 },
  { id: "280", name: "Vilas by Ferns N Petals", city: "Kapashera Estate Road, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "281", name: "Green Leaf Farms", city: "Chattarpur Farm, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "282", name: "H M Farm", city: "7JWC5J+FP, Dera Mandi, New Delhi, Delhi 110074", capacity: 500, basePrice: 1000 },
  { id: "283", name: "Divine Farms", city: "Near Shanni Dham, Chattarpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "284", name: "Rangmanch Farms", city: "Sidhrawal, Manesar, Gurugram (NCR)", capacity: 500, basePrice: 1000 },
  { id: "285", name: "Pradham Farm & Resort", city: "Ansal Aravali Retreat, Raisina, Gurugram (NCR)", capacity: 500, basePrice: 1000 },
  { id: "286", name: "The Vintage - Aarone Farms", city: "Chattarpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "287", name: "The Ocean Pearl Gardenia", city: "Chattarpur Mandir Road, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "288", name: "The Nikunj", city: "NH-8, Near IGI Airport, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "289", name: "Amanata Farms", city: "Bijwasan Road, Kapashera, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "290", name: "Themis Farm House", city: "North Delhi", capacity: 500, basePrice: 1000 },
  { id: "291", name: "Gumber Farms", city: "Asola, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "292", name: "Sukoon Farm Stay", city: "Asola, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "293", name: "Dera Greens", city: "N/A", capacity: 500, basePrice: 1000 },
  { id: "294", name: "The Palms Town & Country Club", city: "Sushant Lok Phase I, Sector 43, Gurugram", capacity: 500, basePrice: 1000 },
  { id: "295", name: "Spara Boutique Resort", city: "Bijwasan, Delhi", capacity: 500, basePrice: 1000 },
  { id: "296", name: "The Ritz by FNP Venues", city: "DLF Phase 3, Gurugram", capacity: 500, basePrice: 1000 },
  { id: "297", name: "Araya Bagh", city: "Ghitorni, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "298", name: "Mallu Farms", city: "Chattarpur, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "299", name: "Grand Mantram", city: "Bandhwari, Gurugram", capacity: 500, basePrice: 1000 },
  { id: "300", name: "The Riyan Farm", city: "Kapashera, New Delhi", capacity: 500, basePrice: 1000 },
  { id: "301", name: "Fortune Park Orange", city: "Manesar, Gurugram", capacity: 500, basePrice: 1000 },
  { id: "302", name: "Royal Pepper Banquet", city: "North Delhi", capacity: 500, basePrice: 1000 },
  { id: "303", name: "Lavanya / Grandeur", city: "North Delhi", capacity: 500, basePrice: 1000 },
  { id: "304", name: "The Gracious", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "305", name: "Casa Royal Banquet", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "306", name: "Hotel Jageer Palace", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "307", name: "Manaktala Farm", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "308", name: "Omnia by Tivoli", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "309", name: "Tivoli Royal Court", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "310", name: "Tivoli Grand Resort / The Royalens", city: "North-West / GT Karnal", capacity: 500, basePrice: 1000 },
  { id: "311", name: "The Ritz by FNP Gardens", city: "Chattarpur / Central", capacity: 500, basePrice: 1000 },
  { id: "312", name: "The Grandeur by Lavanya Banquet", city: "Ashok Vihar", capacity: 500, basePrice: 1000 },
  { id: "313", name: "The Gracious Banquets", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "314", name: "Green Lounge Fusion", city: "GT Karnal Road", capacity: 500, basePrice: 1000 },
  { id: "315", name: "Grand Imperia", city: "GT Karnal Road", capacity: 500, basePrice: 1000 },
  { id: "316", name: "Casa Royal Banquet", city: "Janakpuri", capacity: 500, basePrice: 1000 },
  { id: "317", name: "Araya Bagh New Delhi", city: "Mehrauli", capacity: 500, basePrice: 1000 },
  { id: "318", name: "Surya Grand Hotel", city: "Subhash Nagar", capacity: 500, basePrice: 1000 },
  { id: "319", name: "Vardaan by Sandoz", city: "Pitampura", capacity: 500, basePrice: 1000 },
  { id: "320", name: "Tivoli Bijwasan", city: "Kapashera", capacity: 500, basePrice: 1000 },
  { id: "321", name: "Woodapple Residency", city: "North Delhi (Karkardooma)", capacity: 500, basePrice: 1000 },
  { id: "322", name: "Grand Imperia Banquet", city: "West Delhi (Moti Nagar)", capacity: 500, basePrice: 1000 },
  { id: "323", name: "Hotel Surya Grand, Rajouri Garden", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "324", name: "Andaaj Mansion, Kirti Nagar", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "325", name: "Ocean Pearl Retreat, Chattarpur", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "326", name: "Calista Resort, Rajokri/Kapashera", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "327", name: "Radiance Tania Farms, Chattarpur", city: "South Delhi", capacity: 500, basePrice: 1000 },
  { id: "328", name: "S. Shivangi / The Great Callina Banquet", city: "Delhi NCR", capacity: 500, basePrice: 1000 },
  { id: "329", name: "Colossal Banquet", city: "Delhi NCR", capacity: 500, basePrice: 1000 },
  { id: "330", name: "Hotel Jageer Palace", city: "West Delhi", capacity: 500, basePrice: 1000 },
  { id: "331", name: "Royal Palace Banquets", city: "Noida", capacity: 500, basePrice: 1000 },
  { id: "332", name: "The Mayfair Grand", city: "Noida", capacity: 500, basePrice: 1000 },
  { id: "333", name: "Moon Star Banquet", city: "Noida", capacity: 500, basePrice: 1000 },
  { id: "334", name: "Daimond Crown Banquet", city: "Noida", capacity: 500, basePrice: 1000 },
  { id: "335", name: "74B, Bijwasan Rd", city: "Tivolz Bijwasan", capacity: 500, basePrice: 1000 },
  { id: "336", name: "Regal Manor Gandotra Farms", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "337", name: "Mallu Farms", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "338", name: "DLF Farms Chattarpur", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "339", name: "Amaara Farms", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "340", name: "Orana Aurunm", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "341", name: "The Ocean Pearl Retreat", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "342", name: "Oodles Hotel", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "343", name: "Bel-La Monde Hotel", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "344", name: "Agarwal Dharamshala", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "345", name: "Lilywhite Hotel", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "346", name: "Lado Rani", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "347", name: "Silver Line", city: "East Delhi", capacity: 500, basePrice: 1000 },
  { id: "348", name: "Callina Banquet", city: "East Delhi", capacity: 500, basePrice: 1000 },
  { id: "349", name: "Velet Green", city: "East Delhi", capacity: 500, basePrice: 1000 },
  { id: "350", name: "Tivoli chattarpur", city: "Chattarpur", capacity: 500, basePrice: 1000 },
  { id: "351", name: "Anila Hotel", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "352", name: "The Grace / Gracious", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "353", name: "Azalea Banquet", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "354", name: "Zafferano by Yellow Pepper", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "355", name: "Petal Banquet", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "356", name: "Naraina Vihar Club", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "357", name: "Sarovar Portico Naraina", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "358", name: "Hotel Palm Grand", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "359", name: "The Kings Plaza", city: "Naraina", capacity: 500, basePrice: 1000 },
  { id: "360", name: "The Ritz Banquet Hall", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "361", name: "Sawan Banquets", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "362", name: "Grand Imperia Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "363", name: "The Imperial Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "364", name: "Chandelier by Sandoz", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "365", name: "Zion Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "366", name: "The Oreanns Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "367", name: "Euphoria Mansion", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "368", name: "Coral Bellss Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "369", name: "Mystique Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "370", name: "The Majestic Crown", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "371", name: "Golden Royale Banquet Hall", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
  { id: "372", name: "The Grand Horizon Banquet", city: "Moti Nagar", capacity: 500, basePrice: 1000 },
];


type Step = 'search' | 'form' | 'images';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState<Banquet | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [selectedImagesForGallery, setSelectedImagesForGallery] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const filteredBanquets = BANQUETS.filter(banquet =>
    banquet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banquet.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanquetSelect = (banquet: Banquet) => {
    setSelectedBanquet(banquet);
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentStep('images');
  };

  const handleImagesSelectedForQuote = async (images: string[], isGalleryOnly?: boolean) => {
    if (isGalleryOnly && selectedBanquet) {
      // Generate gallery-only PDF
      try {
        setIsGeneratingPDF(true);
        await generateGalleryPDF(selectedBanquet.name, selectedBanquet.city, images);
        toast({
          title: "Gallery PDF generated successfully!",
          description: "Your banquet gallery PDF has been downloaded.",
        });
      } catch (error) {
        console.error('Gallery PDF generation error:', error);
        toast({
          title: "Error generating gallery PDF",
          description: "Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsGeneratingPDF(false);
      }
    } else {
      // Regular quotation PDF
      setSelectedImagesForGallery(images); // Update state with selected images
      if (selectedBanquet && quoteData) {
        try {
          setIsGeneratingPDF(true);
          await generateQuotationPDF(selectedBanquet, quoteData, images);
          toast({
            title: "PDF Generated Successfully!",
            description: "Your quotation has been downloaded.",
          });
        } catch (error) {
          toast({
            title: "Error generating PDF",
            description: "Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsGeneratingPDF(false);
        }
      }
    }
  };

  const handleGenerateGalleryPDF = async (banquetName: string, city: string) => {
    console.log("Generating Gallery PDF with images:", selectedImagesForGallery);
    try {
      await generateGalleryPDF(banquetName, city, selectedImagesForGallery);
      toast({
        title: "Gallery PDF Generated Successfully!",
        description: "The restaurant gallery PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error generating Gallery PDF",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };


  const resetToSearch = () => {
    setCurrentStep('search');
    setSelectedBanquet(null);
    setQuoteData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Logo.png" alt="Logo" className="h-24 w-24" />
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#601220' }}>Banquet Quotation Maker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/login">
                <Button 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
              {currentStep !== 'search' && (
                <Button 
                  variant="secondary"
                  onClick={resetToSearch}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Step */}
        {currentStep === 'search' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Find Your Perfect Banquet Venue
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search from our curated selection of premium banquet halls and create professional quotations in minutes.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search banquets by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-16 text-lg border-border focus:ring-primary shadow-elegant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanquets.map((banquet) => (
                <div key={banquet.id} className="animate-slide-up">
                  <BanquetCard
                    banquet={banquet}
                    onSelect={handleBanquetSelect}
                  />
                </div>
              ))}
            </div>

            {filteredBanquets.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                  No banquets found matching "{searchQuery}"
                </p>
                <p className="text-muted-foreground mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Step */}
        {currentStep === 'form' && selectedBanquet && (
          <div className="max-w-4xl mx-auto">
            <QuoteForm
              banquet={selectedBanquet}
              onNext={handleFormSubmit}
            />
          </div>
        )}

        {/* Images Step */}
        {currentStep === 'images' && selectedBanquet && (
          <div className="max-w-4xl mx-auto">
            <ImageSelector
              banquetName={selectedBanquet.name}
              city={selectedBanquet.city}
              onImagesSelected={handleImagesSelectedForQuote}
              isGeneratingPDF={isGeneratingPDF}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Banquet Quotation Maker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
