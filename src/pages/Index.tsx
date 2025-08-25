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

}

interface QuoteData {
  clientName: string;
  eventDate: string;
  pricePerPlate: number;
  guests: number;
  rooms: number;
  notes: string;
}

const BANQUETS: Banquet[] = [
  { id: "1", name: "Rambagh Palace", city: "Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005" },
  { id: "2", name: "The Raj Palace", city: "The Raj Palace, Jorawar Singh Gate, Amer Rd, Chokdi Gangapol, Jaipur, Rajasthan 302002" },
  { id: "3", name: "Fairmont Jaipur", city: "2, RIICO Industrial Area, Kukas, Rajasthan 302038" },
  { id: "4", name: "Jai Mahal Palace", city: "Gound Floor, Jacob Rd, near Bharat Petroleum, Civil Lines, Jaipur, Rajasthan 302006" },
  { id: "5", name: "Samode Palace", city: "Village Samode, Tehsil, Chomu, Samod, Rajasthan 303806" },
  { id: "6", name: "Chomu Palace Hotel", city: "Sikar Rd, Naya BaJar, Chomu, Rajasthan 303702" },
  { id: "7", name: "The Oberoi Rajvilas", city: "Babaji Ka Modh, Goner Rd, Jagdish Colony, Prem Nagar, Jaipur, Rajasthan 302031" },
  { id: "8", name: "Ailia Fort Bishangarh", city: "Manoharpur - Bishangarh Link Rd, off NH-8, At, Bishangarh, Rajasthan 303104" },
  { id: "9", name: "Diggi Palace", city: "Diggi House, Shivaji Marg, Sawai Ram Singh Rd, Panch Batti, C Scheme, Ashok Nagar, Jaipur, Rajasthan 302004" },
  { id: "10", name: "Mundota Fort and Palace", city: "Mundota Rd, Mundota, Rajasthan 303706" },
  { id: "11", name: "The Leela Palace Jaipur", city: "Jaipur-Delhi Highway, NH 11, Kukas, Jaipur, Rajasthan 302038" },
  { id: "12", name: "Samode Haveli", city: "Gangapole Road Near, Jorawar Singh Gate, Gangapole, Jaipur, Rajasthan 302002" },
  { id: "13", name: "ITC Rajputana", city: "ITC RAJPUTANA, Gopalbari, Jaipur, Rajasthan 302006" },
  { id: "14", name: "Shahpura House", city: "D-257, Devi Marg, Bani Park, Jaipur, Rajasthan 302016" },
  { id: "15", name: "Narain Niwas Palace Hotel", city: "Hotel Narain Niwas Palace Kanota Bagh, Narayan Singh Rd, Rambagh, Jaipur, Rajasthan 302004" },
  { id: "16", name: "Jaigarh Fort", city: "Devisinghpura, Amer, Jaipur, Rajasthan 302028" },
  { id: "17", name: "Shiv Vilas Resort", city: "Delhi - Jaipur Expy, Kukas, Shiv Vilas Resort, Jaipur, Kookas, Rajasthan 303101" },
  { id: "18", name: "The Gold Palace & Resorts", city: "8th Mile, Jaipur Road, Jaipur, Kookas, Rajasthan 302038" },
  { id: "19", name: "Umaid Palace - A Lakeside Heritage Palace Resort", city: "Kalakho, Post Office Kalakho Dist. Dausa, Jaipur Agra, National Highway, Area, Kalakho, Kandoli, Rajasthan 303304" },
  { id: "20", name: "Alsisar Haveli", city: "Sansar Chandra Rd, Shri Ram Colony, Sindhi Camp, Jaipur, Rajasthan 302001" },
  { id: "21", name: "Pride Amber Vilas", city: "Vatika Mod, 12 Mile, Tonk Rd, Sitapura Industrial Area, Sitapura, Jaipur, Rajasthan 303905" },
  { id: "22", name: "Lohagarh Fort Resort", city: "LOHAGARH FORT RESORT, Rajasthan 303805" },
  { id: "23", name: "Jai Bagh Palace", city: "Village Kacherawala, Tehsil, Amer, Jaipur, Rajasthan 303805" },
  { id: "24", name: "Taj devi ratna resort", city: "Ballupura Farms, No. 8 & 9, Agra Road, Jamdoli, Balloopura, Jaipur, Rajasthan 302031" },
  { id: "25", name: "Roop Garh Palace", city: "250 Meters from NH11, opposite Amity University, Jaipur, Chak Charanwas, Rajasthan 303002" },
  { id: "26", name: "Le Meridian", city: "Number 1 Riico, Kukas, Rajasthan 302038" },
  { id: "27", name: "Bhanwar Singh Palace Jaipur", city: "opposite Solitaire Industrial Park, Bagru, Rajasthan 303007" },
  { id: "28", name: "Club Mahindra Resort", city: "Golimar Garden, Plot no.1, Amer Rd, near Ramgarh Mod, Kagdiwara, Brahampuri, Jaipur, Rajasthan 302002" },
  { id: "29", name: "Raj Mahal palace", city: "Sardar Patel Marg, Shivaji Nagar, Jaipur, Rajasthan 302001" },
  { id: "30", name: "Indana Palace", city: "Jaipur - Delhi Highway, Amer, Kunda, Amer, Jaipur, Rajasthan 302028" },
  { id: "31", name: "momentus by ITC", city: "Khasra No. 66, near Kukas, Natata, Amer Chak No.2, Rajasthan 302028" },
  { id: "32", name: "Fort Chandra gupta", city: "Station Rd, Near Central Bus Stand, Kanti Nagar, Sindhi Camp, Jaipur, Rajasthan 302001" },
  { id: "33", name: "Labh Garh Palace", city: "Cheerwa Ghats, Eklingji Road, National Highway 8, Udaipur, Sare, Rajasthan 313202" },

  // Goa Venues
  { id: "34", name: "W Goa", city: "Vagator Beach, Bardez, Goa, Anjuna, Goa 403509" },
  { id: "35", name: "Goa Marriott Resort & Spa", city: "Post Box, No. 64, Miramar, Goa, Panaji, Goa 403001" },
  { id: "36", name: "Park Regis Goa", city: "Saqwadi,, Arpora, Goa 403509" },
  { id: "37", name: "The LaLiT Golf & Spa Resort Goa", city: "Raj Baga, Palolem, Canacona, Goa 403702" },
  { id: "38", name: "Resort Rio", city: "Near Baga Beach Tambudki, Arpora, Goa 403518" },
  { id: "39", name: "Alila Diwa Goa", city: "48/10, Adao Waddo, Pacheco Vaddo, Majorda, Goa 403713" },
  { id: "40", name: "Grand Hyatt Goa", city: "P.O, Goa University, Aldeia de Goa, Bambolim, Goa 403206" },
  { id: "41", name: "The Zuri White Sands, Goa Resort & Casino", city: "Pedda, Varca, Fatrade, Goa 403721" },
  { id: "42", name: "Planet Hollywood Beach Resort", city: "30/3, Ascona Waddo, Uttorda Beach, Utorda, Goa 403713" },
  { id: "43", name: "Novotel Goa Resort & Spa", city: "Pinto Waddo, off Candolim Road, Candolim, Goa 403515" },
  { id: "44", name: "Taj Exotica Resort & Spa", city: "No address found" },
  { id: "45", name: "The Leela Goa", city: "Mobor, Cavelossim, Goa, Velim, Goa 403731" },
  { id: "46", name: "Le Méridien Goa Calangute", city: "Aguada - Siolim Rd, Gauravaddo, Calangute, Goa 403516" },
  { id: "47", name: "Taj Cidade de Goa Heritage", city: "Dona Paula, Vainguinim Beach, Panaji, Durgavado, Goa 403004" },
  { id: "48", name: "ITC Grand Goa, a Luxury Collection Resort & Spa", city: "Arossim Beach Rd, Arossim, Goa 403712" },
  { id: "49", name: "The St. Regis Goa Resort", city: "Mobor, Cavelossim, Goa, Velim, Goa 403731" },
  { id: "50", name: "Azaya Beach Resort", city: "336/0, Village Calwaddo, Benaulim, Goa 403716" },
  { id: "51", name: "The Westin Goa", city: "Survey No 204/1, Sub Division 1, Bardez, Dmello Vaddo, Anjuna, Goa, 403509" },
  { id: "52", name: "Taj Fort Aguada Resort & Spa", city: "Beach, Sinquerim, Candolim, Goa 403515" },
  { id: "53", name: "Hyatt Centric Candolim Goa", city: "Anna Waddo, Main, Candolim Rd, Gaurawaddo, Candolim, Goa 403515" },
  { id: "54", name: "Taj Holiday Village Resort & Spa", city: "Nerul - Candolim Rd, Sinquerim, Candolim, Goa 403515" },
  { id: "55", name: "Royal Orchid Beach Resort & Spa", city: "Utor da Beach Rd, Utorda, Goa 403713" },
  { id: "56", name: "Taj Cidade de Goa Heritage", city: "Dona Paula, Vainguinim Beach, Panaji, Durgavado, Goa 403004" },
  { id: "57", name: "Cidade de Goa Heritage", city: "Mobor Beach, Cavelossim, Goa 403731" },
  { id: "58", name: "Holiday Inn Resort Goa", city: "Beach, Cavelossim, Mobor Beach, Goa 403731" },
  { id: "59", name: "Radisson Blu Resort Goa Cavelossim Beach", city: "Beach, Varca, Salcete, Goa 403717" },
  { id: "60", name: "Caravela Beach Resort", city: "9RP9+C58 Resort, Bogmalo Road, Bogmalo, Goa 403806" },
  { id: "61", name: "Bogmallo Beach Resort", city: "370/14, Bishop Alex Dias Rd, Porba Vaddo, Bardez, Calangute, Goa 403516" },
  { id: "62", name: "Taj Holiday Village Resort & Spa", city: "Beach Road, Candolim, Goa 403515" },
  { id: "63", name: "Hard Rock Hotel Goa", city: "Utorda, Goa 403713" },
  { id: "64", name: "The Leela Goa", city: "Ximer, Arpora, Goa 403518" },
  { id: "65", name: "The O Hotel Beach Resort and Spa", city: "—" },
  { id: "66", name: "Kenilworth Resort & Spa", city: "—" },
  { id: "67", name: "Planet Hollywood Beach Resort", city: "—" },
  { id: "68", name: "DoubleTree by Hilton Goa - Arpora - Baga", city: "—" },
  { id: "69", name: "Holiday Inn Resort Goa", city: "—" },
  { id: "70", name: "Rio Resort", city: "—" },

  // Delhi & NCR Venues
  { id: "71", name: "The Oberoi, New Delhi", city: "Dr. Zakir Hussain Marg" },
  { id: "72", name: "Taj Palace, New Delhi", city: "Diplomatic Enclave" },
  { id: "73", name: "ITC Maurya, a Luxury Collection Hotel, New Delhi", city: "Diplomatic Enclave, Chanakyapuri" },
  { id: "74", name: "The Oberoi, New Delhi", city: "Diplomatic Enclave, Chanakyapuri" },
  { id: "75", name: "Shangri-La Eros New Delhi", city: "Connaught Place" },
  { id: "76", name: "The Imperial New Delhi", city: "Connaught Place" },
  { id: "77", name: "JW Marriott Hotel New Delhi Aerocity", city: "Aerocity" },
  { id: "78", name: "Hyatt Regency Delhi", city: "Bhikaji Cama Place, Ring Road" },
  { id: "79", name: "The Lodhi, New Delhi", city: "Lodhi Road" },
  { id: "80", name: "Radisson Blu Plaza Hotel, New Delhi Aerocity", city: "Mahipalpur" },
  { id: "81", name: "The LaLiT New Delhi", city: "Connaught Place" },
  { id: "82", name: "Roseate House, New Delhi", city: "Aerocity" },
  { id: "83", name: "Andaz Delhi, by Hyatt", city: "Aerocity" },
  { id: "84", name: "The Grand New Delhi", city: "Vasant Kunj" },
  { id: "85", name: "Welcomhotel by ITC Hotels, Dwarka, New Delhi", city: "Sector 10 Dwarka" },
  { id: "86", name: "Lemon Tree Premier Delhi Airport", city: "Aerocity" },
  { id: "87", name: "Radisson Blu Hotel New Delhi Paschim Vihar", city: "Paschim Vihar" },
  { id: "88", name: "Novotel New Delhi Aerocity", city: "Aerocity" },
  { id: "89", name: "Hyatt Centric Janakpuri, New Delhi", city: "Janakpuri" },
  { id: "90", name: "The Park New Delhi", city: "Connaught Place" },
  { id: "91", name: "Radisson Blu Marina Hotel Connaught Place", city: "Connaught Place" },
  { id: "92", name: "Novotel New Delhi City Centre", city: "Jhandewalan" },
  { id: "93", name: "The Metropolitan Hotel and Spa", city: "Connaught Place" },
  { id: "94", name: "Maidens Hotel", city: "North Delhi" },
  { id: "95", name: "Jaypee Siddharth Hotel", city: "Rajendra Place" },
  { id: "96", name: "Le Meridien Delhi", city: "Connaught Place" },
  { id: "97", name: "Seven Seas Hotel", city: "12, M2K Rd, Mangalam Place, Rohini, New Delhi, Delhi, 110085" },
  { id: "98", name: "Radisson Blu Hotel Kaushambi Delhi NCR", city: "Moidporn Vihar, Sector 14, Kaushambi, Ghaziabad, Uttar Pradesh 201010" },
  { id: "99", name: "Hotel Prince Palace Deluxe", city: "5115, Gali Thanedar, behind Sushant Travels private limited, Bharat Nagar, Paharganj, New Delhi" },
  { id: "100", name: "Hotel Mayda Inn- A Boutique Hotel By Mayda Hospitality Pvt. Ltd.", city: "Dr Zakir Hussain Marg, Delhi Golf Club, Golf Links, New Delhi" },
  { id: "101", name: "Hotel Sunstar Grand", city: "7A/17, Channa Market, Channa Market, Block 7A, WEA, Karol Bagh, Delh" },
  { id: "102", name: "Hotel Sun International", city: "5115, Gali Thanedar, behind Sushant Travels private limited, Bharat Nagar, Paharganj, New Delhi" },
  { id: "103", name: "The Grand Uddhav", city: "253, Street Number 5, A Block, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi" },
  { id: "104", name: "Hotel Sun International", city: "7A/17, Channa Market, Block 7A, WEA, Karol Bagh, Delhi" },
  { id: "105", name: "The Grand Uddhav", city: "4953-54, Ramdwara Rd, Bagichi Ramchander, Nehru Bazar, Paharganj, New Delhi" },
  { id: "106", name: "HOTEL AIRPORT CITY", city: "A-11, Rd Number 1, Block B, Mahipalpur Village, Mahipalpur, New Delhi" },
  { id: "107", name: "Airport Hotel Delhi", city: "Indira Gandhi International Airport, Terminal 1, Opp, Domestic, Mehram Nagar, New Delhi" },
  { id: "108", name: "Centaur Hotel New Delhi Airport", city: "IGI Airport T3 Road, near Indira Gandhi International Airport, New Delhi" },
  { id: "109", name: "ibis New Delhi Aerocity", city: "IGI Rd, Aerocity, Ibis, New Delhi" },
  { id: "110", name: "De Pavilion Hotel, Delhi", city: "250-A, Road No. 6, Block RZ, Mahipalpur Village, Mahipalpur, New Delhi" },
  { id: "111", name: "Radisson Hotel Noida", city: "NOIDA SECTOR 55" },
  { id: "112", name: "Crown PLaza Noida", city: "Chowk Institutional Green, Surajpur, Greater Noida" },
  { id: "113", name: "Vivanta", city: "Dwarka, New Delhi" },
  { id: "114", name: "DoubleTree By Hilton Gurgaon", city: "Sector 50, Gurgaon" },
  { id: "115", name: "The Claridges", city: "12, Dr APJ Abdul Kalam Rd," },
  { id: "116", name: "Holiday Inn", city: "District Centre, 13A, Mayur Place, Mayur Vihar" },
  { id: "117", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road" },
  { id: "118", name: "V Club", city: "Sector 48, Sohna Road" },
  { id: "119", name: "Casabella Banquet", city: "Sector 48, Sohna Road & Sector 33" },
  { id: "120", name: "Kosmos Banquet Hall", city: "Sector 64" },
  { id: "121", name: "The Leela Ambience Gurugram", city: "DLF Phase 3" },
  { id: "122", name: "Royal Swan Banquet", city: "Sector 33" },
  { id: "123", name: "The Riviera by FNP Venues", city: "DLF Phase 3" },
  { id: "124", name: "Green Orchid Farms", city: "Basai" },
  { id: "125", name: "Leolarch Farms", city: "Bawana" },
  { id: "126", name: "Wedlock Farm", city: "Sector 72" },
  { id: "127", name: "Rangmanch Farms", city: "Sachaunra Village" },
  { id: "128", name: "Shubh Banquets & Convention Centre", city: "Sector 39" },
  { id: "129", name: "The City Club", city: "Sohna Road, DLF Phase 4" },
  { id: "130", name: "Leolarch Farms", city: "Badshahpur" },
  { id: "131", name: "Devam Green by WSG", city: "Baliawas" },
  { id: "132", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road" },
  { id: "133", name: "The Ritz by FNP Venues", city: "DLF City Phase 3" },
  { id: "134", name: "The Rivets by FNP Venues", city: "DLF Phase 3" },
  { id: "135", name: "The Westin Sohna Resort & Spa", city: "Sohna Road" },
  { id: "136", name: "Karma Lakelands", city: "Sector 80" },
  { id: "137", name: "GNH Convention", city: "Sohna Road" },
  { id: "138", name: "Walsingham Farms", city: "Sohna Road" },
  { id: "139", name: "Mallu Farms", city: "MG Road" },
  { id: "140", name: "Jain Farms", city: "Sohna" },
  { id: "141", name: "The City Club", city: "Sohna Road, DLF Phase 4" },
  { id: "142", name: "Karma Lakelands", city: "Sector 80, Naurangpur" },
  { id: "143", name: "The Riviera by FNP Venues", city: "DLF Phase 3" },
  { id: "144", name: "GNH Convention", city: "Sohna Road" },
  { id: "145", name: "Walsingham Farms", city: "Sohna Road" },
  { id: "146", name: "Mallu Farms", city: "MG Road" },
  { id: "147", name: "Jain Farms", city: "Sohna Road" },
  { id: "148", name: "The Ritz by FNP Venues", city: "DLF City Phase 3" },
  { id: "149", name: "The Kesar Bagh", city: "Manesar" },
  { id: "150", name: "Radha Krishna Garden", city: "Sector 37" },
  { id: "151", name: "Wedlock Farm", city: "Sector 72" },
  { id: "152", name: "Bliss Premiere", city: "Sector 83" },
  { id: "153", name: "Royal Farm", city: "Sector 57" },
  { id: "154", name: "Tasya Farms", city: "Manesar" },
  { id: "155", name: "Karma Lakelands", city: "Sector 80" },
  { id: "156", name: "Botanix Nature Resort", city: "Sohna Road" },
  { id: "157", name: "A Dot by GNH", city: "N/A" },
  { id: "158", name: "The Kesar Bagh", city: "Manesar" },
  { id: "159", name: "GNH Convention", city: "Sohna Road" },
  { id: "160", name: "The Ritz by FNP Venues", city: "DLF City Phase 3" },
  { id: "161", name: "The Riviera by FNP Venues", city: "DLF City Phase 3" },
  { id: "162", name: "Limón Hotel and Banquet Hall", city: "B-101 South City 1, Sector 30, Gurgaon" },
  { id: "163", name: "Hudson", city: "Arjun Nagar" },
  { id: "164", name: "Aurum", city: "Sector 66, Gurugram" },
  { id: "165", name: "Araya Bagh", city: "Gitorni" },
  { id: "166", name: "Vivaan by SK", city: "Ambliam, Gurgaon, opp. airforce station, gurugram" },
  { id: "167", name: "Royal Swan Banquet", city: "Sector 33, Gurgaon" },
  { id: "168", name: "Shubh Banquets & Convention Centre", city: "At Kalarai rangar sector 13 gurugram" },
  { id: "169", name: "Prism Ballroom Banquet", city: "Sector 2 Faridabad gurugram" },
  { id: "170", name: "Limaro", city: "Sukhrauli enclave sector 17A, gurugram" },
  { id: "171", name: "Bliss Premiere", city: "Palson Village, Gurgaon" },
  { id: "172", name: "Taj Damdama", city: "Gurgaon, Sohna Rd, Damdama, Gurgaon" },
  { id: "173", name: "Tivoli Indian Sona", city: "Vatika Complex, MG Road, Gurgaon" },
  { id: "174", name: "Taj Surajkund Resort", city: "Shooting Range Road, Block-C, Surajkund, Faridabad" },

  // Jim Corbett Venues
  { id: "175", name: "The Solluna Resort", city: "Marchula, Jim Corbett National Park" },
  { id: "176", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli" },
  { id: "177", name: "Namah Resort", city: "Dhikuli Road, Ramnagar" },
  { id: "178", name: "The Den Corbett Resort & Spa", city: "Ranikhet Road, Kumariya" },
  { id: "179", name: "Jim’s Jungle Retreat", city: "Village & PO Dhela, Ramnagar" },
  { id: "180", name: "The Riverview Retreat", city: "Zero Garjia, Ramnagar" },
  { id: "181", name: "The Hridayesh Spa Wilderness Resort", city: "Near Bijrani Safari Gate" },
  { id: "182", name: "Aahana The Corbett Wilderness", city: "Village Semal Khalia, Ramnagar" },
  { id: "183", name: "Lemon Tree Premier", city: "Near Corbett National Park" },
  { id: "184", name: "Amantrum Gateway Resorts", city: "Village: Motipur Negi, Dhela Road" },
  { id: "185", name: "Tiarara Hotels & Resorts", city: "Ramnagar, Nainital" },
  { id: "186", name: "Lohagarh Corbett Resort (Lawn 1)", city: "Jim Corbett" },
  { id: "187", name: "The Golden Tusk (Buzz)", city: "Jim Corbett" },
  { id: "188", name: "Atulya Resort (Hall)", city: "Jim Corbett" },
  { id: "189", name: "Nadiya Parao Resort (Hall)", city: "Jim Corbett" },
  { id: "190", name: "Le Roi Corbett Resort", city: "Jim Corbett" },
  { id: "191", name: "The Tiger Groove (Banquet Hall)", city: "Jim Corbett" },
  { id: "192", name: "Saraca Resort & Spa Corbett", city: "Jim Corbett" },
  { id: "193", name: "Fortune Walkway Mall", city: "Haldwani, Jim Corbett" },
  { id: "194", name: "Corbett Fun Resort", city: "Jim Corbett" },
  { id: "195", name: "StayVista Villa at Amaltas Ramnagar", city: "Ramnagar" },
  { id: "196", name: "Taarini Corbett Camp", city: "Marchula, Jim Corbett" },
  { id: "197", name: "The Den Corbett Resort & Spa", city: "Jim Corbett" },
  { id: "198", name: "Winsome Resorts and Spa", city: "Jim Corbett" },
  { id: "199", name: "Taj Corbett Resort & Spa, Uttarakhand (Board Room)", city: "Jim Corbett" },
  { id: "200", name: "Taj Corbett Resort & Spa, Uttarakhand (Woods)", city: "Jim Corbett" },
  { id: "201", name: "The Tattwaa Corbett Spa & Resort (ARK)", city: "Ramnagar" },
  { id: "202", name: "Tarangi Hotels & Resorts", city: "Ramnagar, Nainital" },
  { id: "203", name: "The Baakhli Corbett", city: "Choi, Ramnagar" },
  { id: "204", name: "Lohagarh Corbett Resort", city: "Jim Corbett" },
  { id: "205", name: "The Golden Tusk", city: "Jim Corbett" },
  { id: "206", name: "Atulya Resort", city: "Jim Corbett" },
  { id: "207", name: "Nadiya Parao Resort", city: "Jim Corbett" },
  { id: "208", name: "Le Roi Corbett Resort", city: "Jim Corbett" },
  { id: "209", name: "The Tiger Groove", city: "Jim Corbett" },
  { id: "210", name: "Corbett View Resort", city: "Village Dhela, Ramnagar" },
  { id: "211", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli" },
  { id: "212", name: "The Tattwaa Corbett Spa & Resort", city: "Himmatpur Dotiyal, Jhirna Road, Ramnagar, Uttarakhand" },

  // Rishikesh Venues
  { id: "213", name: "Taj Rishikesh Resort & Spa", city: "Village Singthali, Tehri Garhwal" },
  { id: "214", name: "Aloha on the Ganges", city: "National Highway 7, 58, Rishikesh, Tapovan" },
  { id: "215", name: "Ganga Kinare - A Riverside Boutique Hotel", city: "237 Virbhadra Rd, Rishikesh" },
  { id: "216", name: "The Divine Resort & Spa", city: "Tapovan Laxman Jhula, Rishikesh" },
  { id: "217", name: "The Westin Resort & Spa", city: "Village Gaurd Chatti, Rishikesh" },
  { id: "218", name: "Namami Ganges Resort & SPA", city: "Shyampur, Badrinath Road, Rishikesh" },
  { id: "219", name: "Shaantam Resort & Spa", city: "Neelkanth Mandir Road, Rishikesh" },
  { id: "220", name: "The Palms Resort", city: "Haridwar - Rishikesh Road, NH 58, Raiwala" },
  { id: "221", name: "Summit By The Ganges Resort & Spa", city: "Village Singthali, Rishikesh" },
  { id: "222", name: "The Roseate Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh" },
  { id: "223", name: "The Forest View Hotel", city: "Dehradun Road, near BSNL Office, Rishikesh" },
  { id: "224", name: "Camp Brook by CampingAie", city: "Village Ghatghat, Neelkanth Road, Rishikesh" },
  { id: "225", name: "Zana by The Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh" },
  { id: "226", name: "The Grand Shiva Resort & Spa", city: "Tapovan, Badrinath Road, Rishikesh" },
  { id: "227", name: "The Bhandari Palace", city: "Khand Gaon Laal Pani, Near New Arto Office, Bypass Road, Rishikesh" },
  { id: "228", name: "Neelkanth Wedding Point", city: "Gunwaliam, Shyampur, Rishikesh" },
  { id: "229", name: "Sai Garden", city: "Raiwala, Haripur Kalan, Haridwar Road, Rishikesh" },
  { id: "230", name: "The Narayana Palace by Salvus", city: "Near Bajari, Rishikesh" },
  { id: "231", name: "Hotel Natraj", city: "Dehradun Road, Natraj Chowk, Rishikesh" },
  { id: "232", name: "Samsara River Resort", city: "Haridwar Highway, Ghatghat, Rishikesh" },
  { id: "233", name: "Midway Resort", city: "Haridwar-Rishikesh Road, Raiwala" },
  { id: "234", name: "Raj Resort", city: "Badrinath Road, Near Laxman Jhula, Tapovan" },
  { id: "235", name: "Him River Resort", city: "Near Phoolchatti Ashram, Neelkanth Mandir Road" },
  { id: "236", name: "Royale Rainbow Resort", city: "Palliayl Gaon, Neelkanth Mandir Road" },
  { id: "237", name: "Antaram Resort", city: "Ghattughat, Badrinath Road, Rishikesh" },
  { id: "238", name: "Simply Heaven Rishikesh", city: "Neelkanth Temple Road, Maral, Near Phoolchatti Ashram" },
  { id: "239", name: "The Neeraj Naturecure", city: "Village, Tapovan, Rishikesh" },
  { id: "240", name: "juSTA Rasa", city: "Syali, Shyampur, Badrinath Road, Rishikesh" },
  { id: "241", name: "Mahayana Resort", city: "Ratapani, Neelkanth Road, Rishikesh" },
  { id: "242", name: "Hotel Shivganga Retreat", city: "Virbhadra, Near All India Radio, Rishikesh" },
  { id: "243", name: "The Grand Shiva Resort & Spa", city: "Badrinath Road, Rishikesh" },
  { id: "244", name: "Creek Forest - Riverside Boutique Resort", city: "Ghattu Ghat, Neelkanth Temple Rd, Rishikesh, Uttarakhand" },

  // Farmhouse & other NCR Venues
  { id: "245", name: "The Riviera by FNP Venues", city: "Ambience Island, Gurugram (NCR)" },
  { id: "246", name: "The Kundan Farms", city: "Kapashera Estate Road, New Delhi" },
  { id: "247", name: "Shagun Farm", city: "Gadaipur Bandh Road, Chattarpur, New Delhi" },
  { id: "248", name: "The Manor Farmhouse", city: "Friends Colony, New Delhi" },
  { id: "249", name: "GNH Convention", city: "Sohna Road, Gurugram (NCR)" },
  { id: "250", name: "Vilas by Ferns N Petals", city: "Kapashera Estate Road, New Delhi" },
  { id: "251", name: "Green Leaf Farms", city: "Chattarpur Farm, New Delhi" },
  { id: "252", name: "H M Farm", city: "7JWC5J+FP, Dera Mandi, New Delhi, Delhi 110074" },
  { id: "253", name: "Divine Farms", city: "Near Shanni Dham, Chattarpur, New Delhi" },
  { id: "254", name: "Rangmanch Farms", city: "Sidhrawal, Manesar, Gurugram (NCR)" },
  { id: "255", name: "Pradham Farm & Resort", city: "Ansal Aravali Retreat, Raisina, Gurugram (NCR)" },
  { id: "256", name: "The Vintage - Aarone Farms", city: "Chattarpur, New Delhi" },
  { id: "257", name: "The Ocean Pearl Gardenia", city: "Chattarpur Mandir Road, New Delhi" },
  { id: "258", name: "The Nikunj", city: "NH-8, Near IGI Airport, New Delhi" },
  { id: "259", name: "Amanata Farms", city: "Bijwasan Road, Kapashera, New Delhi" },
  { id: "260", name: "Themis Farm House", city: "North Delhi" },
  { id: "261", name: "Gumber Farms", city: "Asola, New Delhi" },
  { id: "262", name: "Sukoon Farm Stay", city: "Asola, New Delhi" },
  { id: "263", name: "Dera Greens", city: "N/A" },
  { id: "264", name: "The Palms Town & Country Club", city: "Sushant Lok Phase I, Sector 43, Gurugram" },
  { id: "265", name: "Spara Boutique Resort", city: "Bijwasan, Delhi" },
  { id: "266", name: "The Ritz by FNP Venues", city: "DLF Phase 3, Gurugram" },
  { id: "267", name: "Araya Bagh", city: "Ghitorni, New Delhi" },
  { id: "268", name: "Mallu Farms", city: "Chattarpur, New Delhi" },
  { id: "269", name: "Grand Mantram", city: "Bandhwari, Gurugram" },
  { id: "270", name: "The Riyan Farm", city: "Kapashera, New Delhi" },
  { id: "271", name: "Fortune Park Orange", city: "Manesar, Gurugram" },
  { id: "272", name: "Royal Pepper Banquet", city: "North Delhi" },
  { id: "273", name: "Lavanya / Grandeur", city: "North Delhi" },
  { id: "274", name: "The Gracious", city: "West Delhi" },
  { id: "275", name: "Casa Royal Banquet", city: "West Delhi" },
  { id: "276", name: "Hotel Jageer Palace", city: "West Delhi" },
  { id: "277", name: "Manaktala Farm", city: "South Delhi" },
  { id: "278", name: "Omnia by Tivoli", city: "South Delhi" },
  { id: "279", name: "Tivoli Royal Court", city: "South Delhi" },
  { id: "280", name: "Tivoli Grand Resort / The Royalens", city: "North-West / GT Karnal" },
  { id: "281", name: "The Ritz by FNP Gardens", city: "Chattarpur / Central" },
  { id: "282", name: "The Grandeur by Lavanya Banquet", city: "Ashok Vihar" },
  { id: "283", name: "The Gracious Banquets", city: "Naraina" },
  { id: "284", name: "Green Lounge Fusion", city: "GT Karnal Road" },
  { id: "285", name: "Grand Imperia", city: "GT Karnal Road" },
  { id: "286", name: "Casa Royal Banquet", city: "Janakpuri" },
  { id: "287", name: "Araya Bagh New Delhi", city: "Mehrauli" },
  { id: "288", name: "Surya Grand Hotel", city: "Subhash Nagar" },
  { id: "289", name: "Vardaan by Sandoz", city: "Pitampura" },
  { id: "290", name: "Tivoli Bijwasan", city: "Kapashera" },
  { id: "291", name: "Woodapple Residency", city: "North Delhi (Karkardooma)" },
  { id: "292", name: "Grand Imperia Banquet", city: "West Delhi (Moti Nagar)" },
  { id: "293", name: "Hotel Surya Grand, Rajouri Garden", city: "West Delhi" },
  { id: "294", name: "Andaaj Mansion, Kirti Nagar", city: "West Delhi" },
  { id: "295", name: "Ocean Pearl Retreat, Chattarpur", city: "South Delhi" },
  { id: "296", name: "Calista Resort, Rajokri/Kapashera", city: "South Delhi" },
  { id: "297", name: "Radiance Tania Farms, Chattarpur", city: "South Delhi" },
  { id: "298", name: "S. Shivangi / The Great Callina Banquet", city: "Delhi NCR" },
  { id: "299", name: "Colossal Banquet", city: "Delhi NCR" },
  { id: "300", name: "Hotel Jageer Palace", city: "West Delhi" },
  { id: "301", name: "Royal Palace Banquets", city: "Noida" },
  { id: "302", name: "The Mayfair Grand", city: "Noida" },
  { id: "303", name: "Moon Star Banquet", city: "Noida" },
  { id: "304", name: "Daimond Crown Banquet", city: "Noida" },
  { id: "305", name: "74B, Bijwasan Rd", city: "Tivolz Bijwasan" },
  { id: "306", name: "Regal Manor Gandotra Farms", city: "Chattarpur" },
  { id: "307", name: "Mallu Farms", city: "Chattarpur" },
  { id: "308", name: "DLF Farms Chattarpur", city: "Chattarpur" },
  { id: "309", name: "Amaara Farms", city: "Chattarpur" },
  { id: "310", name: "Orana Aurunm", city: "Naraina" },
  { id: "311", name: "The Ocean Pearl Retreat", city: "Chattarpur" },
  { id: "312", name: "Oodles Hotel", city: "Chattarpur" },
  { id: "313", name: "Bel-La Monde Hotel", city: "Chattarpur" },
  { id: "314", name: "Agarwal Dharamshala", city: "Chattarpur" },
  { id: "315", name: "Lilywhite Hotel", city: "Chattarpur" },
  { id: "316", name: "Lado Rani", city: "Chattarpur" },
  { id: "317", name: "Silver Line", city: "East Delhi" },
  { id: "318", name: "Callina Banquet", city: "East Delhi" },
  { id: "319", name: "Velet Green", city: "East Delhi" },
  { id: "320", name: "Tivoli chattarpur", city: "Chattarpur" },
  { id: "321", name: "Anila Hotel", city: "Naraina" },
  { id: "322", name: "The Grace / Gracious", city: "Naraina" },
  { id: "323", name: "Azalea Banquet", city: "Naraina" },
  { id: "324", name: "Zafferano by Yellow Pepper", city: "Naraina" },
  { id: "325", name: "Petal Banquet", city: "Naraina" },
  { id: "326", name: "Naraina Vihar Club", city: "Naraina" },
  { id: "327", name: "Sarovar Portico Naraina", city: "Naraina" },
  { id: "328", name: "Hotel Palm Grand", city: "Naraina" },
  { id: "329", name: "The Kings Plaza", city: "Naraina" },
  { id: "330", name: "The Ritz Banquet Hall", city: "Moti Nagar" },
  { id: "331", name: "Sawan Banquets", city: "Moti Nagar" },
  { id: "332", name: "Grand Imperia Banquet", city: "Moti Nagar" },
  { id: "333", name: "The Imperial Banquet", city: "Moti Nagar" },
  { id: "334", name: "Chandelier by Sandoz", city: "Moti Nagar" },
  { id: "335", name: "Zion Banquet", city: "Moti Nagar" },
  { id: "336", name: "The Oreanns Banquet", city: "Moti Nagar" },
  { id: "337", name: "Euphoria Mansion", city: "Moti Nagar" },
  { id: "338", name: "Coral Bellss Banquet", city: "Moti Nagar" },
  { id: "339", name: "Mystique Banquet", city: "Moti Nagar" },
  { id: "340", name: "The Majestic Crown", city: "Moti Nagar" },
  { id: "341", name: "Golden Royale Banquet Hall", city: "Moti Nagar" },
  { id: "342", name: "The Grand Horizon Banquet", city: "Moti Nagar" },
  { id: "343", name: "Moushtache Rishikesh Riverside Resort", city: "near Jumpin Heights, Jogiana Pul, Mohan Chatti, Rishikesh" },
  { id: "344", name: "Samsara River Resort by H2O", city: "355, Haridwar Rd, Palika Nagar, Rishikesh" },
  { id: "345", name: "Hotel EliBee Ganga", city: "Gram Jogiyana, Neelkanth Temple Rd, Mohan Chatti, Rishikesh" },
  { id: "346", name: "River Valley Resort Rishikesh", city: "Cheela Dam - Rishikesh Rd, Rishikesh" },
  { id: "347", name: "The Neeraj River Forest Resort", city: "10B, Bees Bigha Main Rd, Bapu Gram, IDPL Colony, Veerbhadra, Rishikesh" },
  { id: "348", name: "Semaity'S Palace", city: "Mohan Chatti, Rishikesh" },
  { id: "349", name: "juSTA Rasa Retreat & Spa", city: "Milestone 30, Badrinath Rd, Rishikesh, Singtali" },
  { id: "350", name: "Atali Ganga", city: "Village, Ghattughat, Rishikesh" },
  { id: "351", name: "Ekantam Riverside Resort", city: "near 23rd Milestone, Badrinath Rd, Gular Dogi, Rishikesh" },
  { id: "352", name: "Anand Kashi by the Ganges", city: "Sheesham Jhari, near Purnanda Inter College, Muni Ki Reti, Rishikesh" },
  { id: "353", name: "Hotel Rishikesh Grand", city: "48JF+PGH, Badrinath Rd, Tapovan, Rishikesh" },
  { id: "354", name: "Indira Nikunj Rubystone Exotic", city: "Unit No.46, Sivananda Ashram Rd, Shisham Jhari, Muni Ki Reti, Rishikesh" },

];


type Step = 'search' | 'form' | 'images';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState<Banquet | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [selectedImagesForGallery, setSelectedImagesForGallery] = useState<string[]>([]);
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

  const handleImagesSelectedForQuote = (images: string[]) => {
    setSelectedImagesForGallery(images); // Update state with selected images
    if (selectedBanquet && quoteData) {
      try {
        generateQuotationPDF(selectedBanquet, quoteData, images);
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
              onImagesSelected={handleImagesSelectedForQuote} // Pass the new handler
            />
            <div className="flex justify-center space-x-4 mt-8">
              <Button onClick={() => handleGenerateGalleryPDF(selectedBanquet.name, selectedBanquet.city)} className="bg-blue-500 hover:bg-blue-600 text-white">
                Generate Restaurant Gallery PDF
              </Button>
            </div>
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
