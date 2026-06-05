// Local mock client replacing external SDKs and avoiding any network connection to fitnessClient servers.
// Saves all data in browser's localStorage, handles local auth, and simulates the AI Fitness Coach.

const createEntityHandler = (entityName) => {
  return {
    list: async (sortField, limit) => {
      // Small helper to get initial mock data if localStorage is empty
      let items = JSON.parse(localStorage.getItem(`fit_db_${entityName}`));
      if (!items) {
        items = getInitialMockData(entityName);
        localStorage.setItem(`fit_db_${entityName}`, JSON.stringify(items));
      }

      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.substring(1) : sortField;
        items.sort((a, b) => {
          const valA = a[field] || '';
          const valB = b[field] || '';
          if (valA < valB) return desc ? 1 : -1;
          if (valA > valB) return desc ? -1 : 1;
          return 0;
        });
      }

      return limit ? items.slice(0, limit) : items;
    },
    filter: async (criteria) => {
      let items = JSON.parse(localStorage.getItem(`fit_db_${entityName}`));
      if (!items) {
        items = getInitialMockData(entityName);
        localStorage.setItem(`fit_db_${entityName}`, JSON.stringify(items));
      }
      return items.filter(item => {
        return Object.entries(criteria).every(([key, value]) => item[key] === value);
      });
    },
    create: async (data) => {
      const items = JSON.parse(localStorage.getItem(`fit_db_${entityName}`) || '[]');
      const newItem = {
        id: Math.random().toString(36).substring(2, 9),
        created_date: new Date().toISOString(),
        ...data
      };
      items.push(newItem);
      localStorage.setItem(`fit_db_${entityName}`, JSON.stringify(items));
      return newItem;
    },
    update: async (id, data) => {
      const items = JSON.parse(localStorage.getItem(`fit_db_${entityName}`) || '[]');
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...data };
        localStorage.setItem(`fit_db_${entityName}`, JSON.stringify(items));
        return items[index];
      }
      throw new Error(`Item ${id} not found in ${entityName}`);
    },
    delete: async (id) => {
      let items = JSON.parse(localStorage.getItem(`fit_db_${entityName}`) || '[]');
      items = items.filter(item => item.id !== id);
      localStorage.setItem(`fit_db_${entityName}`, JSON.stringify(items));
      return { success: true };
    }
  };
};

// Seed initial mock data for first-time use
function getInitialMockData(entityName) {
  if (entityName === 'UserProfile') {
    return [{
      id: 'prof-1',
      display_name: 'Fitness Enthusiast',
      email: 'user@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      age: 28,
      gender: 'male',
      height_cm: 180,
      weight_kg: 82.5,
      target_weight_kg: 78.0,
      body_fat_pct: 18.5,
      fitness_goal: 'lose_fat',
      activity_level: 'moderately_active',
      fitness_experience: 'intermediate',
      dietary_preference: 'high_protein',
      xp: 450,
      level: 4,
      streak_days: 5,
      total_workouts: 12,
      daily_calorie_goal: 2200,
      daily_water_goal_ml: 2500,
      daily_step_goal: 10000
    }];
  }
  if (entityName === 'Workout') {
    return [
      {
        id: 'work-1',
        name: 'Full Body Power Session',
        duration_minutes: 45,
        calories_burned: 420,
        difficulty: 'intermediate',
        created_date: new Date(Date.now() - 24 * 60 * 60 * 1000 * 2).toISOString(),
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: 10, weight_kg: 80 },
          { name: 'Bench Press', sets: 4, reps: 8, weight_kg: 70 },
          { name: 'Deadlift', sets: 3, reps: 5, weight_kg: 100 }
        ]
      },
      {
        id: 'work-2',
        name: 'HIIT Cardio Burn',
        duration_minutes: 30,
        calories_burned: 350,
        difficulty: 'beginner',
        created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        exercises: [
          { name: 'Kettlebell Swings', sets: 3, reps: 20, weight_kg: 16 },
          { name: 'Burpees', sets: 3, reps: 15, weight_kg: 0 },
          { name: 'Plank', sets: 3, reps: 1, weight_kg: 0 }
        ]
      }
    ];
  }
  if (entityName === 'SleepLog') {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return [
      { id: 'sleep-1', date: todayStr, total_hours: 7.5, deep_sleep_hours: 1.8, rem_sleep_hours: 2.1, light_sleep_hours: 3.6, sleep_score: 82, bedtime: '23:00', wake_time: '06:30' },
      { id: 'sleep-2', date: yesterdayStr, total_hours: 6.8, deep_sleep_hours: 1.2, rem_sleep_hours: 1.5, light_sleep_hours: 4.1, sleep_score: 71, bedtime: '23:30', wake_time: '06:18' }
    ];
  }
  if (entityName === 'MealLog') {
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { id: 'meal-1', date: todayStr, meal_type: 'breakfast', food_name: 'Oatmeal with protein powder & banana', calories: 420, protein_g: 30, carbs_g: 58, fat_g: 8 },
      { id: 'meal-2', date: todayStr, meal_type: 'lunch', food_name: 'Grilled chicken salad with olive oil', calories: 510, protein_g: 42, carbs_g: 15, fat_g: 22 }
    ];
  }
  if (entityName === 'HealthMetric') {
    return [
      { id: 'h-1', created_date: new Date().toISOString(), heart_rate: 68, systolic: 120, diastolic: 80, steps: 8400, water_ml: 1800 },
      { id: 'h-2', created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), heart_rate: 72, systolic: 118, diastolic: 78, steps: 11200, water_ml: 2600 }
    ];
  }
  if (entityName === 'BodyComposition') {
    const todayStr = new Date().toISOString().split('T')[0];
    return [
      { id: 'body-1', date: todayStr, weight_kg: 82.5, body_fat_pct: 18.5, bmi: 25.5, bmr: 1845 }
    ];
  }
  if (entityName === 'SocialPost') {
    return [
      { id: 'post-1', author_name: 'John Doe', avatar_url: '', content: 'Just hit a personal record on deadlifts! 150kg feeling super clean today.', post_type: 'workout', likes: 12, created_date: new Date(Date.now() - 60 * 60 * 1000 * 2).toISOString() },
      { id: 'post-2', author_name: 'Sarah Smith', avatar_url: '', content: 'Meal prep Sunday complete! 5 days of healthy lunches sorted.', post_type: 'nutrition', likes: 24, created_date: new Date(Date.now() - 60 * 60 * 1000 * 5).toISOString() }
    ];
  }
  return [];
}

const entitiesProxy = new Proxy({}, {
  get: (target, name) => createEntityHandler(name)
});

// Mock Auth
const auth = {
  me: async () => {
    const token = localStorage.getItem('mock_token');
    if (!token) {
      throw { status: 401, message: 'Authentication required' };
    }
    const profiles = JSON.parse(localStorage.getItem('fit_db_UserProfile') || '[]');
    return profiles[0] || { id: 'prof-1', display_name: 'Fitness User', email: 'user@example.com' };
  },
  loginViaEmailPassword: async (email, password) => {
    localStorage.setItem('mock_token', 'mock-jwt-token');
    // Ensure we have a profile
    const profiles = JSON.parse(localStorage.getItem('fit_db_UserProfile') || '[]');
    if (profiles.length === 0) {
      const defaultProfile = getInitialMockData('UserProfile')[0];
      defaultProfile.email = email;
      defaultProfile.display_name = email.split('@')[0];
      localStorage.setItem('fit_db_UserProfile', JSON.stringify([defaultProfile]));
    }
    return { success: true };
  },
  loginWithProvider: async (provider, redirectUrl) => {
    localStorage.setItem('mock_token', 'mock-jwt-token');
    const profiles = JSON.parse(localStorage.getItem('fit_db_UserProfile') || '[]');
    if (profiles.length === 0) {
      const defaultProfile = getInitialMockData('UserProfile')[0];
      localStorage.setItem('fit_db_UserProfile', JSON.stringify([defaultProfile]));
    }
    window.location.href = redirectUrl || '/';
    return { success: true };
  },
  register: async ({ email, password }) => {
    return { success: true, email };
  },
  verifyOtp: async ({ email, otpCode }) => {
    return { access_token: 'mock-jwt-token' };
  },
  resendOtp: async (email) => {
    return { success: true };
  },
  resetPasswordRequest: async (email) => {
    return { success: true };
  },
  resetPassword: async ({ resetToken, newPassword }) => {
    return { success: true };
  },
  setToken: (token) => {
    localStorage.setItem('mock_token', token);
  },
  logout: (redirectUrl) => {
    localStorage.removeItem('mock_token');
    if (redirectUrl) {
      window.location.href = '/login';
    } else {
      window.location.reload();
    }
  },
  redirectToLogin: (redirectUrl) => {
    window.location.href = '/login';
  }
};

// AI Food Scanner Mock
const integrations = {
  Core: {
    InvokeLLM: async ({ prompt }) => {
      // Analyze prompt for common foods to output smart values
      const text = prompt.toLowerCase();
      let food = 'Healthy Meal';
      let cal = 350, prot = 15, carb = 40, fat = 10;

      if (text.includes('scrambled eggs') || text.includes('egg')) {
        food = 'Scrambled Eggs with Toast';
        cal = 280; prot = 16; carb = 24; fat = 14;
      } else if (text.includes('chicken') || text.includes('breast')) {
        food = 'Grilled Chicken Breast & Rice';
        cal = 480; prot = 38; carb = 45; fat = 8;
      } else if (text.includes('banana')) {
        food = 'Banana';
        cal = 95; prot = 1; carb = 24; fat = 0;
      } else if (text.includes('shake') || text.includes('protein')) {
        food = 'Protein Shake';
        cal = 220; prot = 26; carb = 12; fat = 3;
      } else if (text.includes('salad')) {
        food = 'Fresh Garden Salad';
        cal = 180; prot = 8; carb = 12; fat = 12;
      } else if (text.includes('salmon') || text.includes('fish')) {
        food = 'Baked Salmon with Broccoli';
        cal = 380; prot = 32; carb = 8; fat = 22;
      } else {
        // Generate pseudo-random realistic values
        const seed = prompt.length;
        cal = 150 + (seed % 9) * 50;
        prot = 5 + (seed % 7) * 4;
        carb = 10 + (seed % 11) * 5;
        fat = 2 + (seed % 5) * 3;
      }

      return {
        food_name: food,
        calories: cal,
        protein_g: prot,
        carbs_g: carb,
        fat_g: fat,
        fiber_g: Math.round(carb * 0.1)
      };
    }
  }
};

// AI Fitness Coach Conversation Mock
const conversations = new Map();
const subscriptionCallbacks = new Map();

const getAICoachReply = (userMsg) => {
  const msg = userMsg.toLowerCase();
  
  if (msg.includes('chest') || msg.includes('push')) {
    return `Here is a high-intensity **Chest & Push Workout** tailored for you:
  
1. **Incline Dumbbell Bench Press**: 4 sets x 8-10 reps (Focus on progressive overload)
2. **Flat Barbell Bench Press**: 3 sets x 8 reps
3. **Weighted Dips** or Bodyweight: 3 sets x max reps
4. **Cable Chest Flyes** (High-to-low): 3 sets x 12 reps
5. **Overhead Dumbbell Press** (Shoulders): 3 sets x 10 reps
6. **Tricep Overhead Extensions**: 3 sets x 12 reps

Make sure to rest **90-120 seconds** between compound sets. Make sure you hydrate!`;
  }
  
  if (msg.includes('lose weight') || msg.includes('fat loss') || msg.includes('diet')) {
    return `To effectively lose weight and fat, prioritize these three strategies:
  
1. **Caloric Deficit**: Eat roughly 300-500 calories below your maintenance (your current target is 2200 kcal; try aiming for **1800-1900 kcal**).
2. **High Protein Intake**: Aim for **1.6-2.0g of protein per kg of bodyweight** to maintain muscle mass while losing fat.
3. **NEAT & Cardio**: Increase your daily steps to at least **10,000 steps** and incorporate 2-3 sessions of LISS (Low-Intensity Steady State) cardio weekly.
  
Would you like me to generate a personalized meal layout for tomorrow?`;
  }

  if (msg.includes('sleep')) {
    return `Sleep is critical for muscle synthesis and metabolic health. Try this **Sleep Hygiene Checklist**:
  
- **Wind-Down Window**: No screens or blue light 45-60 minutes before bed.
- **Cool Environment**: Set bedroom temperature to **17-19°C**.
- **No Caffeine Late**: Avoid caffeine intake within **8-10 hours** of bedtime.
- **Consistency**: Keep wake-up times within 30 minutes, even on weekends.`;
  }
  
  if (msg.includes('calories') || msg.includes('macros')) {
    return `Based on your profile, your daily targets are:
  
- **Calorie Goal**: **2,200 kcal**
- **Protein**: **160g** (crucial for muscle recovery)
- **Carbohydrates**: **250g** (primary fuel for intense training)
- **Fats**: **80g** (essential for hormone health)
  
Adjust these by +/-10% depending on whether you feel energetic or fatigued during your workouts.`;
  }

  return `Thanks for asking! That is a great question. In fitness and recovery, consistency is the ultimate key. 

To help you best:
- Focus on hitting your daily protein targets.
- Ensure you sleep at least 7.5 hours tonight.
- Log your next workout in the workout tracker so I can analyze your volume progression.

Let me know if you want to drill down into a specific topic!`;
};

const agents = {
  createConversation: async ({ agent_name, metadata }) => {
    const id = 'conv-' + Math.random().toString(36).substring(2, 9);
    const conversation = {
      id,
      agent_name,
      messages: [
        { role: 'assistant', content: "Hello! I am your AI Fitness Coach. Ask me any questions about workouts, sleep, nutrition, or weight goals!" }
      ]
    };
    conversations.set(id, conversation);
    return conversation;
  },
  subscribeToConversation: (conversationId, callback) => {
    subscriptionCallbacks.set(conversationId, callback);
    // Initial call
    const conv = conversations.get(conversationId);
    if (conv) {
      callback(conv);
    }
    return () => {
      subscriptionCallbacks.delete(conversationId);
    };
  },
  addMessage: async (conversation, message) => {
    const conv = conversations.get(conversation.id);
    if (!conv) return;

    // Append user message
    conv.messages.push(message);
    
    // Trigger callback for UI to show user's message immediately
    const cb = subscriptionCallbacks.get(conv.id);
    if (cb) {
      cb({ ...conv });
    }

    // Simulate AI thinking and reply with a small delay
    setTimeout(() => {
      const reply = getAICoachReply(message.content);
      conv.messages.push({ role: 'assistant', content: reply });
      if (cb) {
        cb({ ...conv });
      }
    }, 1000);

    return { success: true };
  }
};

export const fitnessClient = {
  entities: entitiesProxy,
  auth,
  integrations,
  agents
};
