/* ========================
   FITPULSE – MAIN SCRIPT
   Author: Abhishek Kumar
   Reg No: 24BCE0585
   Course: BCSE203E – Web Programming
   VIT University
======================== */

// ── PAGE ROUTING ─────────────────────────
const pages = ['home','exercises','workouts','bmi','progress','timetable','about'];

function showPage(name, autoCategory) {
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active-link'));
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(a => {
    if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${name}'`)) {
      a.classList.add('active-link');
    }
  });
  // Re-init page-specific code
  if (name === 'progress') {
    document.getElementById('logDate').valueAsDate = new Date();
    updateStats();
    renderLog();
  }
  if (name === 'timetable') buildTimetable();
  if (name === 'workouts') renderPlans(workoutPlans);
  if (name === 'exercises' && autoCategory) {
    setTimeout(() => showCategory(autoCategory), 200);
  }
  // Close mobile menu
  document.querySelector('.nav-links').classList.remove('open');
}

// ── NAVBAR ──────────────────────────────
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.style.boxShadow = window.scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.5)' : 'none';
});

// ── EXERCISE DATA ────────────────────────
const exerciseData = {
  strength: [
    { name: "Barbell Squat", desc: "Compound lower body exercise targeting the quads, glutes and core.", tags: ["Legs","Glutes","Core"] },
    { name: "Bench Press", desc: "Horizontal push movement for chest and triceps strength.", tags: ["Chest","Triceps","Shoulders"] },
    { name: "Deadlift", desc: "Full body posterior chain movement — the king of all lifts.", tags: ["Back","Glutes","Hamstrings"] },
    { name: "Pull-Up", desc: "Upper back width and bicep builder using bodyweight.", tags: ["Back","Biceps","Core"] },
    { name: "Overhead Press", desc: "Vertical push for shoulder and tricep strength.", tags: ["Shoulders","Triceps"] },
    { name: "Bent-Over Row", desc: "Mid-back thickness builder with barbell or dumbbell.", tags: ["Back","Biceps"] },
    { name: "Romanian Deadlift", desc: "Hip hinge movement targeting the hamstrings and glutes.", tags: ["Hamstrings","Glutes"] },
    { name: "Dumbbell Lunge", desc: "Unilateral leg development improving balance and symmetry.", tags: ["Legs","Balance"] },
    { name: "Incline Bench Press", desc: "Upper chest focus with a 30–45° incline angle.", tags: ["Chest","Shoulders"] },
    { name: "Cable Row", desc: "Lat width and mid-back rowing strength with cable machine.", tags: ["Back","Biceps"] },
    { name: "Leg Press", desc: "Machine-based quad and glute builder — great for beginners.", tags: ["Quads","Glutes"] },
    { name: "Dip", desc: "Bodyweight chest and tricep finisher on parallel bars.", tags: ["Chest","Triceps"] },
  ],
  cardio: [
    { name: "Treadmill Run", desc: "Steady-state aerobic base builder at moderate pace.", tags: ["Heart","Endurance"] },
    { name: "Jump Rope", desc: "High calorie burn, coordination, and calf work.", tags: ["Coordination","Calves"] },
    { name: "Cycling", desc: "Low-impact leg cardio suitable for all fitness levels.", tags: ["Quads","Endurance"] },
    { name: "Rowing Machine", desc: "Full body cardio blast engaging back, arms and core.", tags: ["Back","Arms","Core"] },
    { name: "Stair Climber", desc: "Glute activation combined with continuous cardio challenge.", tags: ["Glutes","Legs"] },
    { name: "Swimming", desc: "Zero-impact full body cardio — great for active recovery.", tags: ["Full Body","Recovery"] },
    { name: "Sprint Intervals", desc: "Short bursts of maximal effort to boost VO2 max.", tags: ["Speed","Fat Burn"] },
    { name: "Elliptical Trainer", desc: "Smooth low-impact glide targeting full body aerobics.", tags: ["Full Body","Joints"] },
  ],
  yoga: [
    { name: "Downward Dog", desc: "Hamstring and shoulder opener — foundational yoga pose.", tags: ["Flexibility","Shoulders"] },
    { name: "Warrior I & II", desc: "Leg strength and hip opening sequence.", tags: ["Hips","Balance","Strength"] },
    { name: "Cat-Cow Stretch", desc: "Spinal mobility flow for lower back relief.", tags: ["Spine","Mobility"] },
    { name: "Pigeon Pose", desc: "Deep hip flexor and piriformis release.", tags: ["Hips","Glutes"] },
    { name: "Sun Salutation", desc: "Full body morning flow — 12-pose sequence.", tags: ["Full Body","Flow"] },
    { name: "Child's Pose", desc: "Rest and back release — great between active poses.", tags: ["Back","Recovery"] },
    { name: "Tree Pose", desc: "Single-leg balance and focus improvement.", tags: ["Balance","Ankles"] },
    { name: "Bridge Pose", desc: "Glute activation and gentle spine backbend.", tags: ["Glutes","Spine"] },
    { name: "Seated Forward Fold", desc: "Hamstring and lower back flexibility stretch.", tags: ["Hamstrings","Lower Back"] },
  ],
  hiit: [
    { name: "Burpees", desc: "Full body explosive movement — maximum calorie burn.", tags: ["Full Body","Cardio"] },
    { name: "Box Jumps", desc: "Plyometric lower body power development.", tags: ["Legs","Power"] },
    { name: "Mountain Climbers", desc: "Core and cardio combo at floor level.", tags: ["Core","Cardio"] },
    { name: "Kettlebell Swings", desc: "Hip hinge power and endurance with kettlebell.", tags: ["Hips","Glutes","Cardio"] },
    { name: "Battle Ropes", desc: "Upper body cardio blast with heavy ropes.", tags: ["Shoulders","Arms","Core"] },
    { name: "Jump Squats", desc: "Explosive squat variation for quad and glute power.", tags: ["Legs","Power"] },
    { name: "Lateral Shuffles", desc: "Agility and lateral movement training.", tags: ["Agility","Legs"] },
    { name: "Plank Jacks", desc: "Core stability drill under cardiovascular fatigue.", tags: ["Core","Shoulders"] },
  ],
  core: [
    { name: "Plank", desc: "Isometric core stability — foundation of all core work.", tags: ["Core","Shoulders"] },
    { name: "Bicycle Crunch", desc: "Oblique activation with rotation pattern.", tags: ["Obliques","Abs"] },
    { name: "Dead Bug", desc: "Anti-rotation core control — great for beginners.", tags: ["Core","Stability"] },
    { name: "Russian Twist", desc: "Rotational oblique work with or without weight.", tags: ["Obliques","Core"] },
    { name: "Hanging Leg Raise", desc: "Lower abs and hip flexors on pull-up bar.", tags: ["Lower Abs","Grip"] },
    { name: "Ab Wheel Rollout", desc: "Advanced full core stretch and contraction.", tags: ["Full Core","Advanced"] },
    { name: "Side Plank", desc: "Lateral core stability targeting obliques.", tags: ["Obliques","Glutes"] },
    { name: "V-Sit", desc: "Full ab contraction hold — intense ab finisher.", tags: ["Abs","Hip Flexors"] },
  ],
  recovery: [
    { name: "Foam Rolling – IT Band", desc: "Lateral thigh myofascial release.", tags: ["Legs","Fascia"] },
    { name: "Hip Flexor Stretch", desc: "Psoas and quad release for posture improvement.", tags: ["Hips","Posture"] },
    { name: "Thoracic Rotation", desc: "Upper spine mobility for desk workers.", tags: ["Spine","Posture"] },
    { name: "Lacrosse Ball – Glutes", desc: "Piriformis trigger point therapy.", tags: ["Glutes","Nerves"] },
    { name: "Doorway Chest Opener", desc: "Pec and anterior deltoid stretch.", tags: ["Chest","Posture"] },
    { name: "90/90 Hip Stretch", desc: "Internal and external hip rotation.", tags: ["Hips","Mobility"] },
    { name: "Neck Side Stretch", desc: "Upper trap and neck relief stretch.", tags: ["Neck","Traps"] },
  ],
};

function showCategory(cat) {
  const panel = document.getElementById('exercisePanel');
  const list = document.getElementById('exerciseList');
  const title = document.getElementById('panelTitle');
  const labels = {
    strength: '🏋️ Strength Exercises',
    cardio: '🏃 Cardio Exercises',
    yoga: '🧘 Yoga & Flexibility',
    hiit: '⚡ HIIT Exercises',
    core: '🎯 Core & Abs',
    recovery: '🌿 Recovery Exercises',
  };
  title.textContent = labels[cat];
  list.innerHTML = exerciseData[cat].map(ex => `
    <div class="exercise-item">
      <h4>${ex.name}</h4>
      <p>${ex.desc}</p>
      <div class="tags">${ex.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  `).join('');
  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closePanel() {
  document.getElementById('exercisePanel').classList.remove('visible');
}

// ── WORKOUT PLANS (DETAILED) ─────────────
const workoutPlans = [
  {
    emoji: '🌱',
    name: '28-Day Beginner Reset',
    level: 'beginner',
    desc: 'Full body foundation – build the habit before the muscle.',
    meta: ['4 weeks','3x/week','30 min/session'],
    goal: 'Build exercise habits, improve basic strength & cardiovascular fitness.',
    equipment: 'No equipment needed — bodyweight only.',
    weeks: [
      { title: 'Week 1 – Movement Basics', detail: 'Learn fundamental movement patterns. Focus on form over intensity. 3 sets of 10 reps for each exercise.' },
      { title: 'Week 2 – Volume Build', detail: 'Increase to 4 sets. Introduce light resistance bands. Add 5 min steady-state cardio at end.' },
      { title: 'Week 3 – Intensity Up', detail: '4–5 sets. Reduce rest periods from 90s to 60s. Add jump variations to activate fast-twitch fibres.' },
      { title: 'Week 4 – Peak Week', detail: 'Maximum intensity. Full-body circuits. Measure progress — compare to Week 1 benchmarks.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Full Body A — Squat, Push-Up, Glute Bridge, Plank', rest: false },
      { day: 'Tuesday', workout: 'Rest / Light Walk (20 min)', rest: true },
      { day: 'Wednesday', workout: 'Full Body B — Lunge, Incline Push-Up, Bird Dog, Mountain Climber', rest: false },
      { day: 'Thursday', workout: 'Rest / Yoga / Stretching', rest: true },
      { day: 'Friday', workout: 'Full Body C — Deadlift (bodyweight), Dip, Side Plank, Jumping Jack', rest: false },
      { day: 'Saturday', workout: 'Active Recovery — 30 min walk or swim', rest: true },
      { day: 'Sunday', workout: 'Complete Rest', rest: true },
    ],
    tips: [
      { icon: '💧', text: 'Drink at least 2–3 litres of water daily.' },
      { icon: '😴', text: 'Prioritise 7–8 hours of sleep — recovery happens at rest.' },
      { icon: '🥗', text: 'Eat balanced meals with protein at every meal (0.8–1g per kg body weight).' },
      { icon: '📸', text: 'Take progress photos on Day 1, 14, and 28.' },
    ],
  },
  {
    emoji: '🔥',
    name: 'Fat Burner Circuit',
    level: 'beginner',
    desc: 'HIIT-based cardio designed for rapid fat loss.',
    meta: ['6 weeks','4x/week','40 min/session'],
    goal: 'Maximise calorie burn, improve cardiovascular endurance, reduce body fat.',
    equipment: 'Jump rope, exercise mat, optional: light dumbbells.',
    weeks: [
      { title: 'Week 1–2 – Foundation Cardio', detail: '20 min steady-state cardio + 20 min circuit. Heart rate target: 60–70% max HR.' },
      { title: 'Week 3–4 – HIIT Introduction', detail: '30 sec on / 30 sec off HIIT format. 8 exercises × 4 rounds. HR target: 70–80%.' },
      { title: 'Week 5 – Tabata Intervals', detail: '20 sec on / 10 sec off format (Tabata). Maximum effort bursts. HR target: 80–90%.' },
      { title: 'Week 6 – Peak Fat Burn', detail: 'Full HIIT sessions with metabolic finishers. Compare body measurements to Week 1.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'HIIT Circuit — Burpees, Jump Rope, Mountain Climbers, High Knees (4 rounds)', rest: false },
      { day: 'Tuesday', workout: 'Rest or 20 min easy walk', rest: true },
      { day: 'Wednesday', workout: 'Cardio + Core — Cycling / Run + Plank Variations (30 min)', rest: false },
      { day: 'Thursday', workout: 'Rest / Yoga', rest: true },
      { day: 'Friday', workout: 'Tabata Session — 8 exercises × 4 min Tabata blocks', rest: false },
      { day: 'Saturday', workout: 'Long Steady Run / Swim (45 min moderate pace)', rest: false },
      { day: 'Sunday', workout: 'Complete Rest', rest: true },
    ],
    tips: [
      { icon: '⏱️', text: 'Keep rest under 45 seconds between sets for max fat burn.' },
      { icon: '🍽️', text: 'Maintain a moderate caloric deficit (200–400 kcal/day) alongside training.' },
      { icon: '❤️', text: 'Monitor your heart rate — aim for 70–85% max HR during HIIT.' },
      { icon: '📏', text: 'Measure waist, hips, and chest every two weeks instead of just weighing.' },
    ],
  },
  {
    emoji: '💪',
    name: 'Hypertrophy Split',
    level: 'intermediate',
    desc: 'Push/Pull/Legs for balanced muscle development.',
    meta: ['8 weeks','5x/week','60 min/session'],
    goal: 'Maximise muscle hypertrophy (size) with progressive overload over 8 weeks.',
    equipment: 'Full gym access — barbells, dumbbells, cables, machines.',
    weeks: [
      { title: 'Week 1–2 – Volume Baseline', detail: '4 sets × 10–12 reps per exercise. Establish starting weights for all lifts.' },
      { title: 'Week 3–4 – Progressive Overload', detail: 'Add 2.5–5 kg to main lifts. Increase to 5 sets on compound movements.' },
      { title: 'Week 5–6 – Intensity Techniques', detail: 'Introduce drop sets, supersets and rest-pause sets on isolation exercises.' },
      { title: 'Week 7 – Deload', detail: 'Reduce volume by 40%. Focus on technique. Allow connective tissue to recover.' },
      { title: 'Week 8 – Peak Week', detail: 'Maximum loads, lower reps (6–8). Full progressive overload test from Week 1.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Push A — Bench Press, Incline DB Press, Overhead Press, Lateral Raise, Tricep Pushdown', rest: false },
      { day: 'Tuesday', workout: 'Pull A — Deadlift, Pull-Up, Bent-Over Row, Face Pull, Bicep Curl', rest: false },
      { day: 'Wednesday', workout: 'Legs A — Barbell Squat, Leg Press, Romanian Deadlift, Leg Curl, Calf Raise', rest: false },
      { day: 'Thursday', workout: 'Rest / Light Cardio 20 min', rest: true },
      { day: 'Friday', workout: 'Push B — Dips, Cable Fly, Arnold Press, Skull Crusher, Chest Fly', rest: false },
      { day: 'Saturday', workout: 'Pull B — Cable Row, Lat Pulldown, Single-Arm Row, Hammer Curl, Shrugs', rest: false },
      { day: 'Sunday', workout: 'Complete Rest', rest: true },
    ],
    tips: [
      { icon: '🥩', text: 'Consume 1.6–2.2g protein per kg body weight daily for optimal muscle synthesis.' },
      { icon: '📈', text: 'Log every lift — progressive overload is the #1 driver of hypertrophy.' },
      { icon: '💊', text: 'Creatine monohydrate (3–5g/day) is the most evidence-backed supplement.' },
      { icon: '😴', text: '8 hours of sleep is non-negotiable for muscle recovery and growth hormone release.' },
    ],
  },
  {
    emoji: '🏃',
    name: '5K Speed Builder',
    level: 'intermediate',
    desc: 'Structured running plan to hit your 5K personal best.',
    meta: ['6 weeks','4x/week','45 min/session'],
    goal: 'Improve 5K time through structured interval training and tempo runs.',
    equipment: 'Running shoes, GPS watch (optional), treadmill or outdoor track.',
    weeks: [
      { title: 'Week 1 – Aerobic Base', detail: 'Easy runs at conversational pace. 4 × 1 km intervals at 80% effort.' },
      { title: 'Week 2 – Tempo Runs', detail: 'One 20-min tempo run per week at race pace. Long run extended to 6 km.' },
      { title: 'Week 3 – Speed Work', detail: '400m repeats at 95% effort × 8 sets. Focus on running economy and form.' },
      { title: 'Week 4 – Threshold Training', detail: '3 × 8 min at lactate threshold pace. Push past comfort zone.' },
      { title: 'Week 5 – Race Simulation', detail: 'One full 5K time trial. Analyse pace per km. Adjust strategy.' },
      { title: 'Week 6 – Taper & Race', detail: 'Reduce volume by 50%. Race day: trust the training and execute your plan.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Easy Run — 5 km at conversational pace (Zone 2)', rest: false },
      { day: 'Tuesday', workout: 'Interval Session — 6 × 800m at 90% max pace, 2 min rest', rest: false },
      { day: 'Wednesday', workout: 'Rest / Yoga / Foam Rolling', rest: true },
      { day: 'Thursday', workout: 'Tempo Run — 20 min sustained at 85% effort', rest: false },
      { day: 'Friday', workout: 'Rest', rest: true },
      { day: 'Saturday', workout: 'Long Run — 7–10 km at easy pace (Zone 2)', rest: false },
      { day: 'Sunday', workout: 'Rest / Stretching', rest: true },
    ],
    tips: [
      { icon: '🏁', text: 'Run the first km 5–10 seconds slower than goal pace — avoid early burnout.' },
      { icon: '🫁', text: 'Breathe in for 3 steps, out for 2 (rhythmic breathing) to improve efficiency.' },
      { icon: '👟', text: 'Replace running shoes every 600–800 km to prevent injury.' },
      { icon: '📊', text: 'Track your pace per km — even splits or negative splits = better races.' },
    ],
  },
  {
    emoji: '🧘',
    name: '21-Day Yoga Journey',
    level: 'beginner',
    desc: 'Daily yoga flow for mobility, balance and calm.',
    meta: ['3 weeks','Daily','25 min/session'],
    goal: 'Build flexibility, improve breathing, reduce stress, establish mindfulness practice.',
    equipment: 'Yoga mat, optional: yoga blocks and strap.',
    weeks: [
      { title: 'Week 1 – Foundations', detail: 'Learn 12 foundational poses. Focus on alignment and breath-to-movement sync.' },
      { title: 'Week 2 – Flow Building', detail: 'String poses into continuous flows (Vinyasa). Hold longer — 5 breaths each.' },
      { title: 'Week 3 – Depth & Integration', detail: 'Explore deeper poses. Include Pranayama (breathwork) before each session.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Morning Flow — Sun Salutation A × 5, Warrior I & II, Child\'s Pose', rest: false },
      { day: 'Tuesday', workout: 'Hip Opening — Pigeon Pose, Low Lunge, Seated Forward Fold', rest: false },
      { day: 'Wednesday', workout: 'Balance Day — Tree Pose, Warrior III, Half Moon', rest: false },
      { day: 'Thursday', workout: 'Backbends — Cobra, Bridge Pose, Bow Pose', rest: false },
      { day: 'Friday', workout: 'Core Flow — Boat Pose, Side Plank, Plank Variations', rest: false },
      { day: 'Saturday', workout: 'Yin Yoga — Long holds (3–5 min). Dragon, Butterfly, Deer Pose', rest: false },
      { day: 'Sunday', workout: 'Restorative — Legs Up Wall, Savasana, Meditation (15 min)', rest: false },
    ],
    tips: [
      { icon: '🕯️', text: 'Practice in a quiet space — dim light and candles improve the experience.' },
      { icon: '🫁', text: 'Never hold your breath. Exhale into each stretch for deeper release.' },
      { icon: '⏰', text: 'Morning practice (6–8 AM) sets a positive tone for the entire day.' },
      { icon: '📓', text: 'Journal how you feel after each session — notice mental changes over 21 days.' },
    ],
  },
  {
    emoji: '⚡',
    name: 'HIIT Athlete Program',
    level: 'advanced',
    desc: 'Elite conditioning with heart rate zone training.',
    meta: ['10 weeks','5x/week','50 min/session'],
    goal: 'Maximise VO2 max, build elite cardiovascular fitness, improve athletic performance.',
    equipment: 'Full gym or outdoor space, HR monitor strongly recommended, kettlebells, box.',
    weeks: [
      { title: 'Week 1–2 – Base Assessment', detail: 'Establish VO2 max estimate. Baseline HIIT: 30s on / 30s off × 20 min.' },
      { title: 'Week 3–4 – Zone Training', detail: 'Structured heart rate zone workouts. Zone 2 base building + Zone 4 intervals.' },
      { title: 'Week 5–6 – Advanced Intervals', detail: 'Tabata protocol + EMOM (Every Minute On the Minute) circuits.' },
      { title: 'Week 7–8 – Peak Conditioning', detail: 'Lactate threshold work. 1-mile time trial. Maximum output sessions.' },
      { title: 'Week 9 – Deload', detail: 'Volume cut 50%. Technique focus. Active recovery emphasis.' },
      { title: 'Week 10 – Final Assessment', detail: 'Re-test all Week 1 benchmarks. Measure improvement in VO2 max proxy.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Strength HIIT — Barbell Complex: Clean, Front Squat, Press × 6 rounds', rest: false },
      { day: 'Tuesday', workout: 'Cardio HIIT — 400m repeats × 8, or Rowing Machine intervals × 10', rest: false },
      { day: 'Wednesday', workout: 'Active Recovery — 30 min Zone 2 jog + mobility work', rest: true },
      { day: 'Thursday', workout: 'Mixed Modal — KB Swings, Box Jumps, Battle Ropes, Burpees circuit × 5', rest: false },
      { day: 'Friday', workout: 'Long AMRAP — 40 min As Many Rounds As Possible of full-body moves', rest: false },
      { day: 'Saturday', workout: 'Benchmark WOD — Fran / Murph / Cindy (standard CrossFit workouts)', rest: false },
      { day: 'Sunday', workout: 'Complete Rest', rest: true },
    ],
    tips: [
      { icon: '❤️', text: 'Zone 2 training (60–70% max HR) 2× per week accelerates recovery and builds aerobic base.' },
      { icon: '🥤', text: 'Add electrolytes to water during sessions over 45 min — sodium, potassium, magnesium.' },
      { icon: '📉', text: 'If resting HR rises 5+ bpm above normal, take an extra rest day — early overtraining sign.' },
      { icon: '🏆', text: 'Track benchmark workouts every 4 weeks to measure progress objectively.' },
    ],
  },
  {
    emoji: '🏋️',
    name: 'Powerlifting Foundations',
    level: 'intermediate',
    desc: 'Squat, bench, deadlift — build a serious strength base.',
    meta: ['12 weeks','4x/week','75 min/session'],
    goal: 'Maximise 1-rep maxes on squat, bench press, and deadlift with periodised programming.',
    equipment: 'Barbell, power rack, bench, weight plates. Belt and knee sleeves optional.',
    weeks: [
      { title: 'Week 1–3 – Technique Phase', detail: 'Moderate loads (65–70% 1RM). Perfect squat depth, bar path, and deadlift hinge.' },
      { title: 'Week 4–6 – Hypertrophy Phase', detail: '4 × 8 reps at 70–75% 1RM. Volume drives adaptation.' },
      { title: 'Week 7–9 – Strength Phase', detail: '5 × 5 reps at 80–85% 1RM. Progressive overload every session.' },
      { title: 'Week 10–11 – Peaking', detail: 'Work up to heavy singles (90–95% 1RM). Competition-style openers.' },
      { title: 'Week 12 – Test Week', detail: 'Attempt new 1RM on all three lifts. Rest 48h between each.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Squat Day — Barbell Squat (main), Romanian Deadlift, Leg Press, Core', rest: false },
      { day: 'Tuesday', workout: 'Rest / Light Cardio 20 min', rest: true },
      { day: 'Wednesday', workout: 'Bench Day — Bench Press (main), Incline DB, DB Fly, Tricep, Face Pull', rest: false },
      { day: 'Thursday', workout: 'Rest', rest: true },
      { day: 'Friday', workout: 'Deadlift Day — Deadlift (main), Pull-Up, Cable Row, Bicep Curl, Plank', rest: false },
      { day: 'Saturday', workout: 'Accessory Day — Weak point training + Overhead Press + Mobility', rest: false },
      { day: 'Sunday', workout: 'Complete Rest', rest: true },
    ],
    tips: [
      { icon: '🧱', text: 'Never max out without a proper warm-up — 50%, 65%, 80%, then working sets.' },
      { icon: '🎥', text: 'Video your lifts from the side — it\'s the best free coaching tool available.' },
      { icon: '📊', text: 'Eat at maintenance or slight surplus — strength gains require fuel.' },
      { icon: '🩺', text: 'Knee or lower back discomfort means check your form immediately — don\'t push through.' },
    ],
  },
  {
    emoji: '🎯',
    name: 'Core Mastery 30-Day',
    level: 'intermediate',
    desc: 'Daily progressive core and stability training.',
    meta: ['4 weeks','Daily','20 min/session'],
    goal: 'Build a resilient, strong core — improving posture, stability, and overall strength.',
    equipment: 'Exercise mat, optional: ab wheel, resistance band.',
    weeks: [
      { title: 'Week 1 – Activation', detail: 'Focus on drawing in the navel and activating deep core. Plank holds, dead bugs.' },
      { title: 'Week 2 – Stability', detail: 'Anti-rotation and anti-extension movements. Pallof press, bird dog progressions.' },
      { title: 'Week 3 – Dynamic Core', detail: 'Add movement — bicycle crunches, V-sits, hanging leg raises.' },
      { title: 'Week 4 – Integration', detail: 'Combine all movement patterns in circuit form. Max duration planks, complex ab circuits.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Plank Circuit — Standard + Side Plank + Plank Jacks (3 rounds)', rest: false },
      { day: 'Tuesday', workout: 'Rotation — Russian Twist, Bicycle Crunch, Woodchop (3 rounds)', rest: false },
      { day: 'Wednesday', workout: 'Anti-Ext — Dead Bug, Ab Wheel, Hollow Hold (3 rounds)', rest: false },
      { day: 'Thursday', workout: 'Lower Abs — Hanging Leg Raise, Reverse Crunch, Flutter Kick (3 rounds)', rest: false },
      { day: 'Friday', workout: 'Full Circuit — All 4 days\' best moves combined × 2 rounds', rest: false },
      { day: 'Saturday', workout: 'Yoga Core — Boat Pose, Side Plank Flow, Bird Dog Flow', rest: false },
      { day: 'Sunday', workout: 'Rest / Stretching Focus', rest: true },
    ],
    tips: [
      { icon: '🫁', text: 'Exhale sharply on exertion — core is always stronger when you breathe out.' },
      { icon: '📏', text: 'Quality over quantity — one perfect rep beats five sloppy ones.' },
      { icon: '⏱️', text: 'Increase plank duration by 5 seconds each week as a simple progression marker.' },
      { icon: '🧘', text: 'Add 5 min of yoga at the end of each session for spinal decompression.' },
    ],
  },
  {
    emoji: '🦾',
    name: 'Athletic Performance',
    level: 'advanced',
    desc: 'Speed, power, and agility for competitive athletes.',
    meta: ['16 weeks','6x/week','90 min/session'],
    goal: 'Develop sport-specific athleticism: explosive power, speed, agility, and conditioning.',
    equipment: 'Full gym, agility cones, resistance bands, sled, plyo box, sprint track.',
    weeks: [
      { title: 'Week 1–4 – GPP Phase', detail: 'General Physical Preparedness. Base strength and conditioning across all energy systems.' },
      { title: 'Week 5–8 – SPP Phase', detail: 'Specific Physical Preparation. Sport-specific movement patterns and energy systems.' },
      { title: 'Week 9–12 – Intensity Phase', detail: 'Maximum speed and power training. Plyometrics, Olympic lifts, speed work.' },
      { title: 'Week 13–15 – Competition Prep', detail: 'Simulate game/competition demands. High-specificity drills and match-intensity training.' },
      { title: 'Week 16 – Taper', detail: 'Volume drops 60%. Maintain intensity. Neural priming for peak performance.' },
    ],
    schedule: [
      { day: 'Monday', workout: 'Power — Olympic Lifts (Clean & Jerk / Snatch) + Plyometrics', rest: false },
      { day: 'Tuesday', workout: 'Speed — Sprint Drills, Agility Ladder, 40m Dashes × 10', rest: false },
      { day: 'Wednesday', workout: 'Strength — Squat, Deadlift, Bench (85–90% 1RM)', rest: false },
      { day: 'Thursday', workout: 'Conditioning — HIIT Circuit + Sled Push/Pull', rest: false },
      { day: 'Friday', workout: 'Skill / Agility — Sport drills + Lateral Quickness + Reaction', rest: false },
      { day: 'Saturday', workout: 'Long Conditioning — 60 min mixed modal or sport practice', rest: false },
      { day: 'Sunday', workout: 'Full Rest — mandatory recovery', rest: true },
    ],
    tips: [
      { icon: '⚡', text: 'Plyometrics must be done fresh — always place them at the start of sessions.' },
      { icon: '💉', text: 'Cold water immersion (ice bath) post-training accelerates recovery for daily sessions.' },
      { icon: '🧠', text: 'Mental training is part of athletic performance — visualise success before competition.' },
      { icon: '📋', text: 'Work with a coach if possible — athletic programming is highly individual.' },
    ],
  },
];

function renderPlans(plans) {
  const grid = document.getElementById('plansGrid');
  if (!grid) return;
  grid.innerHTML = plans.map((p, i) => `
    <div class="plan-card" data-level="${p.level}" onclick="openWorkoutModal(${workoutPlans.indexOf(p)})">
      <div class="plan-header">
        <span class="plan-emoji">${p.emoji}</span>
        <span class="plan-level ${p.level}">${p.level}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
      </div>
      <div class="plan-meta">
        ${p.meta.map(m => `<span class="meta-tag">${m}</span>`).join('')}
      </div>
      <span class="plan-cta">View Full Plan & Schedule →</span>
    </div>
  `).join('');
}

function filterPlans(level, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = level === 'all' ? workoutPlans : workoutPlans.filter(p => p.level === level);
  renderPlans(filtered);
}

// ── WORKOUT MODAL ────────────────────────
function openWorkoutModal(index) {
  const p = workoutPlans[index];
  const modal = document.getElementById('workoutModal');
  const content = document.getElementById('modalContent');

  const levelColors = {
    beginner: 'var(--accent3)',
    intermediate: 'var(--accent)',
    advanced: 'var(--accent2)',
  };

  content.innerHTML = `
    <div class="modal-content-inner">
      <div class="modal-hero-bar">
        <div class="modal-emoji">${p.emoji}</div>
        <div>
          <div class="modal-title">${p.name}</div>
          <p class="modal-desc">${p.desc}</p>
          <div class="modal-tags">
            <span class="tag" style="font-size:0.75rem;padding:0.25rem 0.75rem;background:rgba(${p.level==='advanced'?'255,71,87':p.level==='intermediate'?'232,255,71':'78,205,196'},0.12);color:${levelColors[p.level]}">${p.level.toUpperCase()}</span>
            ${p.meta.map(m => `<span class="tag" style="font-size:0.75rem;padding:0.25rem 0.75rem;">${m}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="modal-meta-row">
        <div class="modal-meta-box">
          <span>${p.meta[0]}</span>
          <p>DURATION</p>
        </div>
        <div class="modal-meta-box">
          <span>${p.meta[1]}</span>
          <p>FREQUENCY</p>
        </div>
        <div class="modal-meta-box">
          <span>${p.meta[2]}</span>
          <p>SESSION</p>
        </div>
        <div class="modal-meta-box">
          <span>${p.weeks.length}</span>
          <p>PHASES</p>
        </div>
      </div>

      <div style="background:var(--surface);border-radius:10px;padding:1rem 1.2rem;margin-bottom:1.5rem;font-size:0.85rem;">
        <strong style="color:var(--accent);">🎯 Goal:</strong> <span style="color:var(--muted)">${p.goal}</span><br/>
        <strong style="color:var(--accent3);">🔧 Equipment:</strong> <span style="color:var(--muted)">${p.equipment}</span>
      </div>

      <div class="modal-section-title">📅 Weekly Schedule</div>
      <table class="day-table" style="margin-bottom:1.5rem;">
        <thead>
          <tr>
            <th>DAY</th>
            <th>WORKOUT</th>
          </tr>
        </thead>
        <tbody>
          ${p.schedule.map(s => `
            <tr>
              <td class="day-label">${s.day}</td>
              <td class="${s.rest ? 'rest-day' : ''}">${s.workout}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="modal-section-title">📈 Phase Breakdown</div>
      <div class="week-grid" style="margin-bottom:1.5rem;">
        ${p.weeks.map((w, i) => `
          <div class="week-row">
            <div class="week-num">W${i+1}</div>
            <div class="week-info">
              <h5>${w.title}</h5>
              <p>${w.detail}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="modal-section-title">💡 Pro Tips</div>
      <div class="tips-grid">
        ${p.tips.map(t => `
          <div class="tip-item">
            <span class="tip-icon">${t.icon}</span>
            <span>${t.text}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWorkoutModal(e) {
  if (e.target === document.getElementById('workoutModal')) {
    closeWorkoutModalBtn();
  }
}

function closeWorkoutModalBtn() {
  document.getElementById('workoutModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeWorkoutModalBtn();
});

// ── BMI CALCULATOR (INDIAN STANDARDS) ────
// Reference: ICMR & WHO-SEARO guidelines for South Asian populations
// Overweight: BMI ≥ 23 (not 25 as per Western standards)
// Obese: BMI ≥ 25 (not 30 as per Western standards)
// Normal range: 18.5 – 22.9

let currentUnit = 'metric';

function setUnit(unit) {
  currentUnit = unit;
  document.getElementById('metricBtn').classList.toggle('active', unit === 'metric');
  document.getElementById('imperialBtn').classList.toggle('active', unit === 'imperial');
  document.getElementById('heightLabel').textContent = unit === 'metric' ? 'Height (cm)' : 'Height (inches)';
  document.getElementById('weightLabel').textContent = unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
  document.getElementById('heightInput').placeholder = unit === 'metric' ? 'e.g. 170' : 'e.g. 67';
  document.getElementById('weightInput').placeholder = unit === 'metric' ? 'e.g. 65' : 'e.g. 143';
  document.getElementById('bmiResult').style.display = 'none';
}

function calculateBMI() {
  let h = parseFloat(document.getElementById('heightInput').value);
  let w = parseFloat(document.getElementById('weightInput').value);
  const gender = document.getElementById('genderInput').value;
  const age = parseInt(document.getElementById('ageInput').value);

  if (!h || !w || h <= 0 || w <= 0) {
    alert('Please enter valid height and weight.');
    return;
  }

  // Convert to metric if imperial
  if (currentUnit === 'imperial') {
    h = h * 2.54;      // inches → cm
    w = w * 0.453592;  // lbs → kg
  }

  const hm = h / 100;                      // cm → metres
  const bmi = w / (hm * hm);              // BMI formula
  const bmiRound = bmi.toFixed(1);

  // Indian / South Asian cut-offs (ICMR & WHO-SEARO)
  // Underweight: < 18.5
  // Normal:      18.5 – 22.9
  // Overweight:  23 – 24.9
  // Obese:       ≥ 25

  let category, advice, color;
  if (bmi < 18.5) {
    category = 'Underweight';
    advice = 'Increase caloric intake with nutrient-dense foods. Add strength training to build lean mass. Consult a dietitian for a personalised plan.';
    color = '#4ecdc4';
  } else if (bmi < 23) {
    category = 'Normal Weight ✓';
    advice = 'Excellent! Your BMI is in the healthy range for Indians. Maintain your balanced diet and regular exercise. Annual health check-ups recommended.';
    color = '#2ed573';
  } else if (bmi < 25) {
    category = 'Overweight (Indian Standard)';
    advice = 'You are in the overweight range per ICMR guidelines. A moderate caloric deficit (300–500 kcal/day) with increased physical activity is recommended. Consult your doctor.';
    color = 'orange';
  } else {
    category = 'Obese (Indian Standard)';
    advice = 'Your BMI indicates obesity by Indian health standards. Please consult a healthcare professional for a structured weight management and diet plan. Lifestyle changes are important.';
    color = '#ff4757';
  }

  // Ideal weight range using Indian normal BMI (18.5–22.9)
  const idealLow = (18.5 * hm * hm).toFixed(1);
  const idealHigh = (22.9 * hm * hm).toFixed(1);

  // Also compute Western standard range for comparison
  const westernHigh = (24.9 * hm * hm).toFixed(1);

  const result = document.getElementById('bmiResult');
  document.getElementById('bmiValue').textContent = bmiRound;
  document.getElementById('bmiCategory').textContent = category;
  document.getElementById('bmiCategory').style.color = color;
  document.getElementById('bmiAdvice').textContent = advice;
  document.getElementById('idealWeight').textContent = `✅ Indian ideal weight: ${idealLow}–${idealHigh} kg (BMI 18.5–22.9)`;
  document.getElementById('idealWeightIndian').textContent = `ℹ️ Western standard ideal: up to ${westernHigh} kg (BMI up to 24.9)`;
  document.querySelector('.result-circle').style.borderColor = color;
  document.querySelector('.result-circle span').style.color = color;
  result.style.display = 'flex';
}

// Allow Enter key in BMI form
['heightInput','weightInput','ageInput'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('keydown', e => {
    if (e.key === 'Enter') calculateBMI();
  });
});

// ── PROGRESS TRACKER ─────────────────────
let workouts = JSON.parse(localStorage.getItem('fp_workouts') || '[]');

function saveWorkouts() {
  localStorage.setItem('fp_workouts', JSON.stringify(workouts));
}

function updateStats() {
  const totalW = document.getElementById('totalWorkouts');
  const totalM = document.getElementById('totalMinutes');
  const totalC = document.getElementById('totalCalories');
  if (totalW) totalW.textContent = workouts.length;
  if (totalM) totalM.textContent = workouts.reduce((s, w) => s + (w.duration || 0), 0);
  if (totalC) totalC.textContent = workouts.reduce((s, w) => s + (w.calories || 0), 0);
}

function renderLog() {
  const log = document.getElementById('workoutLog');
  if (!log) return;
  if (workouts.length === 0) {
    log.innerHTML = '<p class="empty-log">No workouts logged yet. Start tracking today!</p>';
    return;
  }
  const sorted = [...workouts].reverse();
  log.innerHTML = sorted.map((w, i) => `
    <div class="log-entry">
      <div class="log-left">
        <h4>${w.type} Workout</h4>
        <p>${w.date}${w.notes ? ' · ' + w.notes : ''}</p>
      </div>
      <div class="log-right" style="display:flex;align-items:center;gap:0.4rem">
        <div style="text-align:right">
          <span>${w.duration} min</span>
          <p>${w.calories ? w.calories + ' kcal' : ''}</p>
        </div>
        <button class="del-btn" onclick="deleteWorkout(${workouts.length - 1 - i})">✕</button>
      </div>
    </div>
  `).join('');
}

function logWorkout() {
  const date = document.getElementById('logDate').value;
  const type = document.getElementById('logType').value;
  const duration = parseInt(document.getElementById('logDuration').value);
  const calories = parseInt(document.getElementById('logCalories').value) || 0;
  const notes = document.getElementById('logNotes').value.trim();

  if (!date || !duration || duration <= 0) {
    alert('Please fill in date and duration.');
    return;
  }

  workouts.push({ date, type, duration, calories, notes });
  saveWorkouts();
  updateStats();
  renderLog();

  document.getElementById('logDuration').value = '';
  document.getElementById('logCalories').value = '';
  document.getElementById('logNotes').value = '';
}

function deleteWorkout(index) {
  workouts.splice(index, 1);
  saveWorkouts();
  updateStats();
  renderLog();
}

// ── TIMETABLE ────────────────────────────
const times = ['6:00 AM','7:00 AM','8:00 AM','9:00 AM','10:00 AM','12:00 PM','4:00 PM','5:30 PM','6:30 PM','7:30 PM'];

const schedule = {
  '6:00 AM':  ['strength','Deadlift & Squats','Coach Raj','cardio','Morning Run','Coach Priya','yoga','Sunrise Yoga','Meera','strength','Power Hour','Coach Raj','hiit','HIIT Blast','Coach Sam','core','Core Burn','Coach Priya','rest','Rest','—'],
  '7:00 AM':  ['cardio','Spin Class','Coach Priya','hiit','Tabata','Coach Sam','strength','Upper Body','Coach Raj','cardio','Cycle Endurance','Coach Priya','yoga','Flow Yoga','Meera','hiit','Weekend HIIT','Coach Sam','yoga','Gentle Yoga','Meera'],
  '8:00 AM':  ['yoga','Vinyasa Flow','Meera','strength','Full Body','Coach Raj','cardio','Zumba','Coach Priya','hiit','Circuit','Coach Sam','strength','Chest & Back','Coach Raj','strength','Olympic Lift','Coach Raj','rest','Rest','—'],
  '9:00 AM':  ['core','Pilates Core','Meera','yoga','Yin Yoga','Meera','hiit','Bootcamp','Coach Sam','strength','Legs Day','Coach Raj','core','Abs Attack','Coach Sam','cardio','Trail Run','Coach Priya','rest','Rest','—'],
  '10:00 AM': ['hiit','CrossFit WOD','Coach Sam','core','Core & Stretch','Meera','strength','Push Day','Coach Raj','yoga','Balance Flow','Meera','cardio','Aerobics','Coach Priya','yoga','Restorative','Meera','rest','Rest','—'],
  '12:00 PM': ['cardio','Lunch Run','Coach Priya','strength','Pull Day','Coach Raj','core','Midday Core','Coach Sam','cardio','Step Aerobics','Coach Priya','rest','Open Gym','—','hiit','HIIT Advanced','Coach Sam','rest','Rest','—'],
  '4:00 PM':  ['strength','Arm Sculpt','Coach Raj','hiit','Kickboxing','Coach Sam','yoga','Stress Relief','Meera','strength','Shoulders','Coach Raj','cardio','Zumba Mix','Coach Priya','core','Core Power','Coach Sam','rest','Rest','—'],
  '5:30 PM':  ['hiit','Evening HIIT','Coach Sam','strength','Squat Special','Coach Raj','cardio','Dance Cardio','Coach Priya','core','Plank Challenge','Coach Sam','strength','Friday Power','Coach Raj','yoga','Evening Flow','Meera','rest','Rest','—'],
  '6:30 PM':  ['yoga','Evening Yoga','Meera','cardio','Rowing Circuit','Coach Priya','strength','Pull & Core','Coach Raj','hiit','HIIT Express','Coach Sam','cardio','Cycle Blast','Coach Priya','strength','Functional Fit','Coach Raj','rest','Rest','—'],
  '7:30 PM':  ['core','Night Core','Coach Sam','yoga','Night Unwind','Meera','hiit','Late HIIT','Coach Sam','yoga','Breathwork','Meera','core','Weekend Prep','Coach Sam','rest','Cool Down','—','rest','Rest','—'],
};

const typeMap = { strength:'tt-strength', cardio:'tt-cardio', yoga:'tt-yoga', hiit:'tt-hiit', core:'tt-core', rest:'tt-rest' };

function buildTimetable() {
  const tbody = document.getElementById('timetableBody');
  if (!tbody) return;
  tbody.innerHTML = times.map(time => {
    const slots = schedule[time];
    const cells = Array.from({ length: 7 }, (_, i) => {
      const type = slots[i * 3];
      const name = slots[i * 3 + 1];
      const instructor = slots[i * 3 + 2];
      return `<td><div class="tt-class ${typeMap[type]}" title="${instructor}">${name}<br><small>${instructor}</small></div></td>`;
    }).join('');
    return `<tr><td class="time-col">${time}</td>${cells}</tr>`;
  }).join('');
}

// ── INIT ─────────────────────────────────
showPage('home');
renderPlans(workoutPlans);
buildTimetable();
updateStats();
renderLog();
