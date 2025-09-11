import { PrismaClient, TemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplates = [
  {
    name: 'Modern Sports Center',
    description:
      'Clean and modern design perfect for sports centers and fitness facilities',
    category: TemplateCategory.MODERN,
    htmlTemplate: `
      <div class="facility-page modern-template">
        <header class="hero-section">
          <div class="hero-content">
            <h1 class="facility-name">{{facilityName}}</h1>
            <p class="facility-tagline">{{facilityDescription}}</p>
            <div class="contact-info">
              <span class="phone">📞 {{phone}}</span>
              <span class="address">📍 {{address}}</span>
            </div>
          </div>
          <div class="hero-image">
            {{facilityImages}}
          </div>
        </header>
        
        <section class="facilities-section">
          <h2>Our Facilities</h2>
          <div class="courts-grid">
            {{courtsGrid}}
          </div>
        </section>
        
        <section class="booking-section">
          <h2>Book Now</h2>
          <div class="booking-widget">
            {{bookingWidget}}
          </div>
        </section>
        
        <section class="location-section">
          <h2>Find Us</h2>
          <div class="map-container">
            {{locationMap}}
          </div>
        </section>
        
        <footer class="facility-footer">
          <p>&copy; 2024 {{facilityName}}. Powered by Booksan.</p>
        </footer>
      </div>
    `,
    cssTemplate: `
      .modern-template {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 80px 20px;
        text-align: center;
      }
      
      .facility-name {
        font-size: 3.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .facility-tagline {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.95;
      }
      
      .contact-info {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-wrap: wrap;
      }
      
      .contact-info span {
        background: rgba(255,255,255,0.2);
        padding: 0.5rem 1rem;
        border-radius: 25px;
        backdrop-filter: blur(10px);
      }
      
      .facilities-section, .booking-section, .location-section {
        max-width: 1200px;
        margin: 0 auto;
        padding: 4rem 2rem;
      }
      
      .facilities-section h2, .booking-section h2, .location-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #2d3748;
      }
      
      .courts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }
      
      .court-card {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      }
      
      .court-card:hover {
        transform: translateY(-5px);
      }
      
      .booking-widget {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      
      .facility-footer {
        background: #2d3748;
        color: white;
        text-align: center;
        padding: 2rem;
      }
      
      @media (max-width: 768px) {
        .facility-name {
          font-size: 2.5rem;
        }
        .contact-info {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
    previewImage: '/templates/modern-sports-center-preview.jpg',
    isPremium: false,
  },
  {
    name: 'Classic Tennis Club',
    description:
      'Traditional and elegant design for tennis clubs and country clubs',
    category: TemplateCategory.CLASSIC,
    htmlTemplate: `
      <div class="facility-page classic-template">
        <header class="classic-header">
          <nav class="main-nav">
            <div class="logo">{{facilityName}}</div>
            <ul class="nav-menu">
              <li><a href="#about">About</a></li>
              <li><a href="#facilities">Facilities</a></li>
              <li><a href="#booking">Book Court</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </header>
        
        <section class="hero-banner">
          <div class="hero-overlay">
            <h1>Welcome to {{facilityName}}</h1>
            <p class="hero-subtitle">{{facilityDescription}}</p>
            <a href="#booking" class="cta-button">Book Your Court</a>
          </div>
        </section>
        
        <section id="about" class="about-section">
          <div class="container">
            <div class="content-grid">
              <div class="about-text">
                <h2>About Our Club</h2>
                <p>{{facilityDescription}}</p>
              </div>
              <div class="about-stats">
                <div class="stat-item">
                  <h3>{{courtCount}}</h3>
                  <p>Professional Courts</p>
                </div>
                <div class="stat-item">
                  <h3>{{operatingHours}}</h3>
                  <p>Operating Hours</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="facilities" class="facilities-showcase">
          <div class="container">
            <h2>Our Facilities</h2>
            {{courtsShowcase}}
          </div>
        </section>
        
        <section id="booking" class="booking-area">
          <div class="container">
            <h2>Reserve Your Court</h2>
            {{bookingForm}}
          </div>
        </section>
        
        <footer id="contact" class="club-footer">
          <div class="container">
            <div class="footer-content">
              <div class="contact-details">
                <h3>Contact Information</h3>
                <p>📍 {{address}}</p>
                <p>📞 {{phone}}</p>
              </div>
              <div class="footer-logo">
                <h3>{{facilityName}}</h3>
                <p>Excellence in Sports</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `,
    cssTemplate: `
      .classic-template {
        font-family: 'Georgia', 'Times New Roman', serif;
        color: #2c3e50;
      }
      
      .classic-header {
        background: #fff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 1000;
      }
      
      .main-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
        color: #27ae60;
      }
      
      .nav-menu {
        display: flex;
        list-style: none;
        gap: 2rem;
        margin: 0;
        padding: 0;
      }
      
      .nav-menu a {
        text-decoration: none;
        color: #2c3e50;
        font-weight: 500;
        transition: color 0.3s ease;
      }
      
      .nav-menu a:hover {
        color: #27ae60;
      }
      
      .hero-banner {
        height: 80vh;
        background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), 
                    url('/default-tennis-bg.jpg') center/cover;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        margin-top: 70px;
      }
      
      .hero-banner h1 {
        font-size: 3.5rem;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      }
      
      .hero-subtitle {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        max-width: 600px;
      }
      
      .cta-button {
        display: inline-block;
        background: #27ae60;
        color: white;
        padding: 1rem 2rem;
        text-decoration: none;
        border-radius: 5px;
        font-size: 1.1rem;
        transition: background 0.3s ease;
      }
      
      .cta-button:hover {
        background: #219a52;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }
      
      .about-section, .facilities-showcase, .booking-area {
        padding: 5rem 0;
      }
      
      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 4rem;
        align-items: center;
      }
      
      .about-text h2, .facilities-showcase h2, .booking-area h2 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        color: #2c3e50;
      }
      
      .about-stats {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
      
      .stat-item {
        text-align: center;
        padding: 2rem;
        background: #f8f9fa;
        border-radius: 10px;
      }
      
      .stat-item h3 {
        font-size: 2rem;
        color: #27ae60;
        margin-bottom: 0.5rem;
      }
      
      .club-footer {
        background: #2c3e50;
        color: white;
        padding: 3rem 0;
      }
      
      .footer-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      
      @media (max-width: 768px) {
        .content-grid, .footer-content {
          grid-template-columns: 1fr;
        }
        .hero-banner h1 {
          font-size: 2.5rem;
        }
        .nav-menu {
          display: none;
        }
      }
    `,
    previewImage: '/templates/classic-tennis-club-preview.jpg',
    isPremium: false,
  },
  {
    name: 'Sport Complex Pro',
    description:
      'Professional multi-sport facility template with booking integration',
    category: TemplateCategory.SPORT_SPECIFIC,
    htmlTemplate: `
      <div class="facility-page sport-complex-template">
        <div class="top-bar">
          <div class="container">
            <div class="contact-quick">
              <span>📞 {{phone}}</span>
              <span>📧 {{email}}</span>
              <span>🕒 {{openHours}}</span>
            </div>
          </div>
        </div>
        
        <header class="main-header">
          <div class="container">
            <div class="header-content">
              <div class="logo-section">
                <h1>{{facilityName}}</h1>
                <p>Multi-Sport Complex</p>
              </div>
              <div class="quick-book">
                <a href="#book-now" class="book-btn">Quick Book</a>
              </div>
            </div>
          </div>
        </header>
        
        <section class="sports-showcase">
          <div class="container">
            <h2>Available Sports</h2>
            <div class="sports-grid">
              {{sportsGrid}}
            </div>
          </div>
        </section>
        
        <section class="courts-section">
          <div class="container">
            <h2>Our Courts & Facilities</h2>
            <div class="courts-layout">
              {{courtsLayout}}
            </div>
          </div>
        </section>
        
        <section id="book-now" class="booking-hub">
          <div class="container">
            <h2>Book Your Session</h2>
            <div class="booking-interface">
              {{advancedBookingWidget}}
            </div>
          </div>
        </section>
        
        <section class="amenities-section">
          <div class="container">
            <h2>Amenities & Services</h2>
            <div class="amenities-grid">
              <div class="amenity-card">
                <h3>🚿 Changing Rooms</h3>
                <p>Modern locker rooms with shower facilities</p>
              </div>
              <div class="amenity-card">
                <h3>🅿️ Free Parking</h3>
                <p>Ample parking space for all visitors</p>
              </div>
              <div class="amenity-card">
                <h3>🥤 Refreshments</h3>
                <p>Snack bar and drink vending machines</p>
              </div>
              <div class="amenity-card">
                <h3>🏆 Equipment Rental</h3>
                <p>Professional equipment available for rent</p>
              </div>
            </div>
          </div>
        </section>
        
        <footer class="complex-footer">
          <div class="container">
            <div class="footer-grid">
              <div class="footer-info">
                <h3>{{facilityName}}</h3>
                <p>{{address}}</p>
                <p>{{phone}}</p>
              </div>
              <div class="footer-hours">
                <h3>Operating Hours</h3>
                {{operatingHoursTable}}
              </div>
              <div class="footer-social">
                <h3>Follow Us</h3>
                <div class="social-links">
                  {{socialLinks}}
                </div>
              </div>
            </div>
            <div class="footer-bottom">
              <p>&copy; 2024 {{facilityName}}. Powered by Booksan.</p>
            </div>
          </div>
        </footer>
      </div>
    `,
    cssTemplate: `
      .sport-complex-template {
        font-family: 'Roboto', sans-serif;
        color: #333;
      }
      
      .top-bar {
        background: #1a202c;
        color: white;
        padding: 0.5rem 0;
        font-size: 0.9rem;
      }
      
      .contact-quick {
        display: flex;
        justify-content: center;
        gap: 2rem;
      }
      
      .main-header {
        background: white;
        box-shadow: 0 2px 15px rgba(0,0,0,0.1);
        padding: 1rem 0;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .logo-section h1 {
        font-size: 2rem;
        color: #e53e3e;
        margin: 0;
      }
      
      .logo-section p {
        color: #666;
        margin: 0;
      }
      
      .book-btn {
        background: #e53e3e;
        color: white;
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        border-radius: 25px;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      
      .book-btn:hover {
        background: #c53030;
        transform: translateY(-2px);
      }
      
      .sports-showcase, .courts-section, .booking-hub, .amenities-section {
        padding: 4rem 0;
      }
      
      .sports-showcase {
        background: #f7fafc;
      }
      
      .sports-showcase h2, .courts-section h2, .booking-hub h2, .amenities-section h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
        color: #2d3748;
      }
      
      .sports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }
      
      .sport-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      }
      
      .sport-card:hover {
        transform: translateY(-5px);
      }
      
      .courts-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
      }
      
      .booking-hub {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .booking-hub h2 {
        color: white;
      }
      
      .booking-interface {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        color: #333;
      }
      
      .amenities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }
      
      .amenity-card {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        border: 2px solid #e2e8f0;
        transition: border-color 0.3s ease;
      }
      
      .amenity-card:hover {
        border-color: #e53e3e;
      }
      
      .amenity-card h3 {
        color: #e53e3e;
        margin-bottom: 1rem;
      }
      
      .complex-footer {
        background: #2d3748;
        color: white;
        padding: 3rem 0 1rem;
      }
      
      .footer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }
      
      .footer-bottom {
        text-align: center;
        padding-top: 2rem;
        border-top: 1px solid #4a5568;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }
      
      @media (max-width: 768px) {
        .contact-quick {
          flex-direction: column;
          text-align: center;
          gap: 0.5rem;
        }
        .header-content {
          flex-direction: column;
          gap: 1rem;
        }
        .sports-grid, .courts-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
    previewImage: '/templates/sport-complex-pro-preview.jpg',
    isPremium: true,
  },
  {
    name: 'Minimalist Venue',
    description:
      'Clean, minimal design focusing on content and user experience',
    category: TemplateCategory.BASIC,
    htmlTemplate: `
      <div class="facility-page minimal-template">
        <header class="minimal-header">
          <div class="container">
            <h1 class="site-title">{{facilityName}}</h1>
            <nav class="minimal-nav">
              <a href="#info">Info</a>
              <a href="#courts">Courts</a>
              <a href="#book">Book</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </header>
        
        <section class="hero-minimal">
          <div class="container">
            <div class="hero-content">
              <h2>{{facilityDescription}}</h2>
              <p class="location">📍 {{address}}</p>
              <p class="contact">📞 {{phone}}</p>
            </div>
          </div>
        </section>
        
        <section id="courts" class="courts-minimal">
          <div class="container">
            <h3>Available Courts</h3>
            <div class="courts-list">
              {{courtsList}}
            </div>
          </div>
        </section>
        
        <section id="book" class="booking-minimal">
          <div class="container">
            <h3>Make a Reservation</h3>
            <div class="booking-form">
              {{simpleBookingForm}}
            </div>
          </div>
        </section>
        
        <section id="contact" class="contact-minimal">
          <div class="container">
            <h3>Get in Touch</h3>
            <div class="contact-grid">
              <div class="contact-info">
                <p><strong>Address:</strong> {{address}}</p>
                <p><strong>Phone:</strong> {{phone}}</p>
                <p><strong>Hours:</strong> {{operatingHours}}</p>
              </div>
              <div class="map-placeholder">
                {{locationMap}}
              </div>
            </div>
          </div>
        </section>
        
        <footer class="minimal-footer">
          <div class="container">
            <p>{{facilityName}} • Powered by Booksan</p>
          </div>
        </footer>
      </div>
    `,
    cssTemplate: `
      .minimal-template {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      
      .minimal-header {
        background: white;
        border-bottom: 1px solid #eee;
        padding: 1rem 0;
      }
      
      .minimal-header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .site-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: #000;
      }
      
      .minimal-nav {
        display: flex;
        gap: 2rem;
      }
      
      .minimal-nav a {
        text-decoration: none;
        color: #666;
        font-weight: 400;
        transition: color 0.3s ease;
      }
      
      .minimal-nav a:hover {
        color: #000;
      }
      
      .hero-minimal {
        padding: 4rem 0;
        text-align: center;
      }
      
      .hero-minimal h2 {
        font-size: 2rem;
        font-weight: 300;
        margin-bottom: 2rem;
        color: #000;
      }
      
      .hero-minimal p {
        font-size: 1.1rem;
        color: #666;
        margin: 0.5rem 0;
      }
      
      .courts-minimal, .booking-minimal, .contact-minimal {
        padding: 3rem 0;
        border-top: 1px solid #eee;
      }
      
      .courts-minimal h3, .booking-minimal h3, .contact-minimal h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 2rem;
        color: #000;
      }
      
      .courts-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .court-item {
        padding: 1.5rem;
        border: 1px solid #eee;
        border-radius: 5px;
        background: #fafafa;
      }
      
      .court-item h4 {
        margin: 0 0 0.5rem 0;
        color: #000;
      }
      
      .court-item p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
      
      .booking-form {
        background: #f9f9f9;
        padding: 2rem;
        border-radius: 5px;
        border: 1px solid #eee;
      }
      
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      
      .contact-info p {
        margin: 0.5rem 0;
        color: #666;
      }
      
      .map-placeholder {
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 5px;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
      }
      
      .minimal-footer {
        background: #f9f9f9;
        border-top: 1px solid #eee;
        padding: 2rem 0;
        text-align: center;
      }
      
      .minimal-footer p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
      }
      
      @media (max-width: 768px) {
        .minimal-header .container {
          flex-direction: column;
          gap: 1rem;
        }
        .minimal-nav {
          justify-content: center;
        }
        .contact-grid {
          grid-template-columns: 1fr;
        }
        .courts-list {
          grid-template-columns: 1fr;
        }
      }
    `,
    previewImage: '/templates/minimalist-venue-preview.jpg',
    isPremium: false,
  },
];

async function seedFacilityTemplates() {
  console.log('🌱 Seeding facility page templates...');

  try {
    // Clear existing templates
    await prisma.facilityPageTemplate.deleteMany();
    console.log('🗑️ Cleared existing templates');

    // Create new templates
    for (const template of defaultTemplates) {
      const created = await prisma.facilityPageTemplate.create({
        data: template,
      });
      console.log(`✅ Created template: ${created.name}`);
    }

    console.log('🎉 Template seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedFacilityTemplates();
}

export { seedFacilityTemplates };
