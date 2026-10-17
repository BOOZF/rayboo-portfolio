const img = f => '/assets/doors/madam-kwan/' + f;
export default {
  id:'madam-kwan', title:"Madam Kwan's Mini Program", sub:'Customer ordering & rewards app', era:'Restaurant app · 2024–2025',
  color:'#ff6b6b', icon:'bag', role:'Full-stack developer → deployment lead', tags:['Next.js', 'React', 'Kubernetes', 'CI/CD', 'Back office'],
  link:{ url:'https://emp.cmg.com.my/home', label:"Open Madam Kwan's mini program" },
  chapters:[
    { title:'The Problem', text:"Madam Kwan's needed a customer mini program: browse the menu, order for pickup, collect points and redeem vouchers, all in one place, backed by a back office the restaurant team could run themselves.",
      caption:'"Welcome to Madam Kwan\'s."', images:[{ src:img('home.webp'), alt:"Mini program home screen with birthday voucher promotion", kind:'phone' }] },
    { title:'The Build', text:'I served on the full-stack team across the full SDLC, starting as an intern and continuing as a team lead.',
      bullets:['Frontend and backend integration for the customer mini program', 'Built and maintained the back-office frontend in Next.js and React', 'Led deployment and staging on Kubernetes', 'Optimised UI components for performance'],
      caption:'"Menu, pickup and rewards, one tap apart."', images:[{ src:img('menu.webp'), alt:'Pickup ordering menu screen', kind:'phone' }, { src:img('rewards.webp'), alt:'Rewards and cash voucher screen', kind:'phone' }] },
    { title:'The Impact', text:'A shipped customer-facing product, live with real diners and ordering, rewards and profiles end to end, which taught me production delivery on Kubernetes.',
      caption:'"Shipped, and in customers\' pockets."', images:[{ src:img('profile-screen.webp'), alt:'Customer profile screen', kind:'phone' }] },
  ],
};
