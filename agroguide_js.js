// AgroGuide - Topraksız Tarım Rehber Uygulaması JavaScript

// Global Variables
let currentScreen = 'home-screen';
let userProfile = {};
let selectedSystemType = 'nft';
let currentStep = 1;
let productionData = {
    startDate: new Date(),
    waterLevel: 80,
    phLevel: 6.2,
    plantCount: 18,
    systemUptime: 24,
    notifications: []
};

// Application State Management
const AppState = {
    user: {
        isLoggedIn: false,
        profile: {},
        preferences: {}
    },
    system: {
        selected: null,
        installed: false,
        configuration: {}
    },
    production: {
        active: false,
        data: productionData,
        history: []
    }
};

// Utility Functions
const Utils = {
    // Local Storage Management
    saveToStorage: function(key, data) {
        try {
            localStorage.setItem(`agroguide_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    loadFromStorage: function(key) {
        try {
            const data = localStorage.getItem(`agroguide_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage load error:', error);
            return null;
        }
    },

    // Date Formatting
    formatDate: function(date) {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    // Number Formatting
    formatNumber: function(number, decimals = 1) {
        return Number(number).toFixed(decimals);
    },

    // Generate Random ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce Function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validate Email
    validateEmail: function(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    },

    // Validate Phone
    validatePhone: function(phone) {
        const re = /^(\+90|0)?5\d{9}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
};

// Screen Management System
const ScreenManager = {
    currentScreen: 'home-screen',
    history: ['home-screen'],

    showScreen: function(screenId, addToHistory = true) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;

            if (addToHistory && this.history[this.history.length - 1] !== screenId) {
                this.history.push(screenId);
            }

            // Update bottom navigation
            this.updateBottomNav(screenId);
            
            // Trigger screen-specific actions
            this.onScreenChange(screenId);
        }
    },

    goBack: function() {
        if (this.history.length > 1) {
            this.history.pop();
            const previousScreen = this.history[this.history.length - 1];
            this.showScreen(previousScreen, false);
        }
    },

    updateBottomNav: function(screenId) {
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const navMapping = {
            'home-screen': 0,
            'guide-screen': 1,
            'production-screen': 2,
            'community-screen': 3
        };

        if (navMapping[screenId] !== undefined) {
            const navItems = document.querySelectorAll('.bottom-nav-item');
            if (navItems[navMapping[screenId]]) {
                navItems[navMapping[screenId]].classList.add('active');
            }
        }
    },

    onScreenChange: function(screenId) {
        switch (screenId) {
            case 'production-screen':
                ProductionTracker.updateDisplay();
                break;
            case 'community-screen':
                CommunityManager.loadPosts();
                break;
            case 'suppliers-screen':
                SupplierManager.loadSuppliers();
                break;
        }
    }
};

// Profile Management System
const ProfileManager = {
    createProfile: function() {
        const experience = document.getElementById('experience')?.value;
        const purpose = document.getElementById('purpose')?.value;
        const area = document.getElementById('area')?.value;
        const budget = document.getElementById('budget')?.value;
        const crops = document.getElementById('crops')?.value;

        if (!experience || !purpose || !area || !budget || !crops) {
            NotificationManager.show('Lütfen tüm alanları doldurun.', 'warning');
            return false;
        }

        userProfile = {
            id: Utils.generateId(),
            experience,
            purpose,
            area: parseInt(area),
            budget,
            crops,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Save to storage
        Utils.saveToStorage('userProfile', userProfile);
        AppState.user.profile = userProfile;
        AppState.user.isLoggedIn = true;

        // Generate system recommendation
        const recommendation = this.generateSystemRecommendation(userProfile);
        ModalManager.showRecommendation(recommendation);

        return true;
    },

    generateSystemRecommendation: function(profile) {
        let recommendation = {
            system: 'NFT',
            systemType: 'nft',
            reason: '',
            cost: '',
            yield: '',
            difficulty: 'Orta',
            waterSaving: '70%',
            advantages: [],
            disadvantages: []
        };

        // Experience-based recommendations
        if (profile.experience === 'beginner') {
            if (profile.budget === 'low') {
                recommendation = {
                    system: 'DWC (Deep Water Culture)',
                    systemType: 'dwc',
                    reason: 'Başlangıç için en basit ve ekonomik sistem. Kurulum kolay, bakım minimal.',
                    cost: '2,000-4,000 TL',
                    difficulty: 'Kolay',
                    waterSaving: '60%',
                    advantages: ['Düşük maliyet', 'Kolay kurulum', 'Hızlı büyüme'],
                    disadvantages: ['Sınırlı bitki çeşitliliği', 'Elektrik bağımlılığı']
                };
            } else {
                recommendation = {
                    system: 'NFT (Nutrient Film Technique)',
                    systemType: 'nft',
                    reason: 'Başlangıç dostu ve orta seviye verimlilik. İyi su tasarrufu sağlar.',
                    cost: '3,000-6,000 TL',
                    difficulty: 'Orta',
                    waterSaving: '70%',
                    advantages: ['Su tasarrufu', 'Sürekli beslenme', 'Temiz üretim'],
                    disadvantages: ['Pompa bağımlılığı', 'Elektrik kesintisine duyarlı']
                };
            }
        } else if (profile.experience === 'intermediate') {
            recommendation = {
                system: 'Ebb & Flow (Gel-Git)',
                systemType: 'ebb-flow',
                reason: 'Orta seviye deneyim için ideal. Çok çeşitli bitki yetiştirebilirsiniz.',
                cost: '4,000-8,000 TL',
                difficulty: 'Orta',
                waterSaving: '65%',
                advantages: ['Çok yönlü', 'Güvenilir', 'Çeşitli bitkiler'],
                disadvantages: ['Kompleks kurulum', 'Düzenli kontrol gerekli']
            };
        } else if (profile.experience === 'advanced') {
            recommendation = {
                system: 'Aeroponik Sistem',
                systemType: 'aeroponic',
                reason: 'Maximum verim ve kontrol imkanı. En gelişmiş topraksız tarım yöntemi.',
                cost: '8,000-15,000 TL',
                difficulty: 'Zor',
                waterSaving: '90%',
                advantages: ['Maksimum verim', 'Hızlı büyüme', 'Su tasarrufu'],
                disadvantages: ['Yüksek maliyet', 'Teknik bilgi gerekli', 'Bakım yoğun']
            };
        }

        // Area-based adjustments
        if (profile.area < 5) {
            recommendation.cost = recommendation.cost.replace(/\d+/g, match => Math.floor(parseInt(match) * 0.7));
        } else if (profile.area > 20) {
            recommendation.cost = recommendation.cost.replace(/\d+/g, match => Math.floor(parseInt(match) * 1.5));
        }

        // Yield calculation
        const baseYield = this.calculateYield(profile.area, profile.crops, recommendation.systemType);
        recommendation.yield = baseYield;

        return recommendation;
    },

    calculateYield: function(area, crops, systemType) {
        const multipliers = {
            'dwc': 0.8,
            'nft': 1.0,
            'ebb-flow': 0.9,
            'aeroponic': 1.3
        };

        const cropYields = {
            'leafy': { base: 1.2, unit: 'kg yapraklı sebze/ay' },
            'herbs': { base: 0.8, unit: 'kg aromatik bitki/ay' },
            'tomatoes': { base: 2.5, unit: 'kg domates/mevsim' },
            'strawberries': { base: 1.8, unit: 'kg çilek/mevsim' },
            'mixed': { base: 1.0, unit: 'kg karışık ürün/ay' }
        };

        const multiplier = multipliers[systemType] || 1.0;
        const cropData = cropYields[crops] || cropYields['mixed'];
        const baseYield = area * cropData.base * multiplier;

        return `${Utils.formatNumber(baseYield)} ${cropData.unit}`;
    },

    loadProfile: function() {
        const saved = Utils.loadFromStorage('userProfile');
        if (saved) {
            userProfile = saved;
            AppState.user.profile = saved;
            AppState.user.isLoggedIn = true;
            return true;
        }
        return false;
    },

    updateProfile: function(updates) {
        userProfile = { ...userProfile, ...updates, updatedAt: new Date() };
        Utils.saveToStorage('userProfile', userProfile);
        AppState.user.profile = userProfile;
    }
};

// System Selection Manager
const SystemManager = {
    systems: {
        nft: {
            name: 'NFT (Nutrient Film Technique)',
            icon: '🌊',
            description: 'Sürekli akan ince besin filmi ile bitkileri besleyen sistem',
            advantages: ['Su tasarrufu', 'Sürekli beslenme', 'Temiz üretim'],
            suitableFor: ['Marul', 'Ispanak', 'Aromatik bitkiler'],
            cost: '2,000-8,000 TL',
            difficulty: 'Orta',
            waterSaving: '70%'
        },
        dwc: {
            name: 'DWC (Deep Water Culture)',
            icon: '💧',
            description: 'Bitki köklerinin doğrudan besin çözeltisinde durduğu sistem',
            advantages: ['Hızlı büyüme', 'Basit sistem', 'Düşük maliyet'],
            suitableFor: ['Yapraklı sebzeler', 'Fesleğen', 'Su ürünleri'],
            cost: '1,500-6,000 TL',
            difficulty: 'Kolay',
            waterSaving: '60%'
        },
        aeroponic: {
            name: 'Aeroponik Sistem',
            icon: '💨',
            description: 'Bitki köklerine besin çözeltisinin püskürtüldüğü sistem',
            advantages: ['Maksimum verim', 'Minimum su', 'Hızlı büyüme'],
            suitableFor: ['Domates', 'Biber', 'Çilek'],
            cost: '5,000-15,000 TL',
            difficulty: 'Zor',
            waterSaving: '90%'
        },
        'ebb-flow': {
            name: 'Ebb & Flow (Gel-Git)',
            icon: '🔄',
            description: 'Periyodik olarak su veren ve boşaltan sistem',
            advantages: ['Esnek', 'Çok ürün tipi', 'Güvenilir'],
            suitableFor: ['Çilek', 'Domates', 'Çeşitli sebzeler'],
            cost: '3,000-10,000 TL',
            difficulty: 'Orta',
            waterSaving: '65%'
        }
    },

    selectSystem: function(systemType) {
        selectedSystemType = systemType;
        AppState.system.selected = systemType;
        Utils.saveToStorage('selectedSystem', systemType);

        // Update UI
        document.querySelectorAll('.system-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Find and select the clicked card
        const clickedCard = event.target.closest('.system-card');
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }

        // Update selected system display
        this.updateSelectedSystemDisplay(systemType);
        
        NotificationManager.show(`${this.systems[systemType].name} seçildi! Kurulum rehberine geçebilirsiniz.`, 'success');
    },

    updateSelectedSystemDisplay: function(systemType) {
        const system = this.systems[systemType];
        const displayElement = document.getElementById('selected-system');
        if (displayElement && system) {
            displayElement.textContent = system.name;
        }
    },

    getSystemDetails: function(systemType) {
        return this.systems[systemType] || null;
    },

    loadSelectedSystem: function() {
        const saved = Utils.loadFromStorage('selectedSystem');
        if (saved) {
            selectedSystemType = saved;
            AppState.system.selected = saved;
            this.updateSelectedSystemDisplay(saved);
            return true;
        }
        return false;
    }
};

// Installation Guide Manager
const GuideManager = {
    currentStep: 1,
    totalSteps: 5,

    steps: {
        nft: [
            {
                title: 'Malzeme Hazırlığı',
                description: 'Gerekli malzemeleri temin edin',
                materials: [
                    'PVC boru (110mm, 2m) - 4 adet',
                    'Su pompası (800L/h) - 1 adet',
                    'Rezervuar tank (50L) - 1 adet',
                    'Hortum ve bağlantı parçaları',
                    'Bitki sepetleri - 20 adet',
                    'Perlit veya taş yünü'
                ],
                tips: ['Kaliteli malzeme seçin', 'Pompanın gücünü kontrol edin']
            },
            {
                title: 'Montaj İşlemleri',
                description: 'Sistemin montajını gerçekleştirin',
                steps: [
                    'PVC boruları 15° eğimle yerleştirin',
                    'Her 20cm\'de bitki deliği açın (5cm çap)',
                    'Su pompasını rezervuara bağlayın',
                    'Dönüş hortumunu rezervuara bağlayın'
                ],
                tips: ['Eğimi düzgün ayarlayın', 'Sızdırmazlığı kontrol edin']
            },
            {
                title: 'Besin Çözeltisi Hazırlığı',
                description: 'Bitkilerin ihtiyacı olan besin çözeltisini hazırlayın',
                steps: [
                    'pH değerini 5.5-6.5 arasında ayarlayın',
                    'EC değerini 1.2-1.8 arasında tutun',
                    'A ve B besin çözeltilerini karıştırın',
                    'Su sıcaklığını 18-22°C\'de tutun'
                ],
                tips: ['pH metre kullanın', 'Sıcaklığı kontrol edin']
            },
            {
                title: 'Sistem Testi',
                description: 'Sistemin düzgün çalışıp çalışmadığını test edin',
                steps: [
                    'Pompayı çalıştırın ve su akışını kontrol edin',
                    'Tüm borularda su akışını gözlemleyin',
                    'Sızıntı olup olmadığını kontrol edin',
                    'Timer\'ı ayarlayın (15 dk açık, 15 dk kapalı)'
                ],
                tips: ['24 saat test yapın', 'Tüm bağlantıları kontrol edin']
            },
            {
                title: 'Fide Dikimi',
                description: 'Hazırladığınız fideleri sisteme yerleştirin',
                steps: [
                    'Fideleri bitki sepetlerine yerleştirin',
                    'Kök bölgesini perlit ile destekleyin',
                    'Sepetleri deliklere yerleştirin',
                    'İlk 24 saat pompa sürekli çalışsın'
                ],
                tips: ['Hassas davranın', 'Kökleri incitmeyin']
            }
        ]
    },

    nextStep: function() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateProgress();
            this.showStep(this.currentStep);
        } else {
            this.completeGuide();
        }
    },

    previousStep: function() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgress();
            this.showStep(this.currentStep);
        }
    },

    updateProgress: function() {
        const percentage = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    },

    showStep: function(stepNumber) {
        // Hide all steps
        document.querySelectorAll('[id^="step-"]').forEach(step => {
            step.style.display = 'none';
        });

        // Show current step
        const currentStepElement = document.getElementById(`step-${stepNumber}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }
    },

    completeGuide: function() {
        AppState.system.installed = true;
        Utils.saveToStorage('systemInstalled', true);
        
        NotificationManager.show('🎉 Kurulum başarıyla tamamlandı! Artık üretim takibine geçebilirsiniz.', 'success');
        
        setTimeout(() => {
            ScreenManager.showScreen('production-screen');
        }, 2000);
    },

    resetGuide: function() {
        this.currentStep = 1;
        this.updateProgress();
        this.showStep(1);
    }
};

// Production Tracking System
const ProductionTracker = {
    data: productionData,

    updateDisplay: function() {
        this.updateStats();
        this.updateChecklist();
        this.updateNotifications();
        this.updateWeeklyReport();
    },

    updateStats: function() {
        const systemUptime = Math.floor((new Date() - this.data.startDate) / (1000 * 60 * 60 * 24));
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card .stat-number');
        if (statCards.length >= 2) {
            statCards[0].textContent = systemUptime;
            statCards[1].textContent = this.data.plantCount;
        }
    },

    updateChecklist: function() {
        // Randomly check some items for demo
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            if (Math.random() > 0.5) {
                checkbox.checked = true;
            }
        });
    },

    updateNotifications: function() {
        const notifications = [
            { type: 'warning', message: 'Besin çözeltisini değiştirme zamanı (2 gün kaldı)', priority: 'high' },
            { type: 'info', message: 'Su seviyesi %75 - Normal seviyede', priority: 'low' },
            { type: 'success', message: 'Sistem 24 saattir sorunsuz çalışıyor', priority: 'low' }
        ];

        // Add random notification
        if (Math.random() > 0.7) {
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            this.addNotification(randomNotification);
        }
    },

    updateWeeklyReport: function() {
        const waterSaving = Math.floor(Math.random() * 20) + 50; // 50-70% range
        const growthRate = ['Yavaş', 'Normal', 'Hızlı'][Math.floor(Math.random() * 3)];
        const harvestWeeks = Math.floor(Math.random() * 3) + 1; // 1-3 weeks

        const reportElement = document.querySelector('.weekly-report');
        if (reportElement) {
            reportElement.innerHTML = `
                <p><strong>Su tüketimi:</strong> 45L (-${waterSaving}% tasarruf)</p>
                <p><strong>Büyüme oranı:</strong> ${growthRate}</p>
                <p><strong>Beklenen hasat:</strong> ${harvestWeeks} hafta</p>
            `;
        }
    },

    addNotification: function(notification) {
        this.data.notifications.unshift({
            id: Utils.generateId(),
            ...notification,
            timestamp: new Date()
        });

        // Keep only last 10 notifications
        if (this.data.notifications.length > 10) {
            this.data.notifications = this.data.notifications.slice(0, 10);
        }

        // Save to storage
        Utils.saveToStorage('productionData', this.data);
    },

    toggleTask: function(taskId) {
        // Handle task completion
        const checkbox = document.getElementById(taskId);
        if (checkbox) {
            const isCompleted = checkbox.checked;
            if (isCompleted) {
                NotificationManager.show('✅ Görev tamamlandı!', 'success');
            }
        }
    },

    exportData: function() {
        const exportData = {
            userProfile: userProfile,
            selectedSystem: selectedSystemType,
            productionData: this.data,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `agroguide_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        NotificationManager.show('📊 Veriler başarıyla dışa aktarıldı!', 'success');
    }
};

// Supplier Management System
const SupplierManager = {
    suppliers: [
        {
            id: 1,
            name: 'Tarım Tek A.Ş.',
            location: 'İstanbul',
            products: ['NFT sistemi komple seti'],
            price: '3,500 TL',
            rating: 4.8,
            reviewCount: 127,
            contact: 'info@tarimtek.com.tr',
            phone: '0212 555 0123',
            features: ['Ücretsiz kurulum', '2 yıl garanti', 'Teknik destek']
        },
        {
            id: 2,
            name: 'Sera Malzeme Ltd.',
            location: 'Antalya',
            products: ['DWC sistemi ve besin çözeltileri'],
            price: '2,800 TL',
            rating: 4.6,
            reviewCount: 89,
            contact: 'info@seramalzeme.com.tr',
            phone: '0242 555 0456',
            features: ['Hızlı teslimat', '1 yıl garanti', 'Online destek']
        },
        {
            id: 3,
            name: 'Hidroponik Teknoloji',
            location: 'İzmir',
            products: ['Aeroponik sistem ve otomasyonu'],
            price: '8,500 TL',
            rating: 4.9,
            reviewCount: 156,
            contact: 'info@hidroponiktek.com.tr',
            phone: '0232 555 0789',
            features: ['Otomasyon dahil', '3 yıl garanti', '7/24 destek']
        }
    ],

    loadSuppliers: function() {
        // This would typically load suppliers from an API
        this.displaySuppliers(this.suppliers);
    },

    displaySuppliers: function(suppliers) {
        const container = document.querySelector('.suppliers-container');
        if (!container) return;

        container.innerHTML = suppliers.map(supplier => `
            <div class="supplier-card" data-supplier-id="${supplier.id}">
                <div class="supplier-header">
                    <h3>🏭 ${supplier.name}</h3>
                    <div class="price-tag">${supplier.location}</div>
                </div>
                <p>${supplier.products.join(', ')}</p>
                <p><strong>Fiyat:</strong> ${supplier.price}</p>
                <p>⭐ ${supplier.rating}/5 (${supplier.reviewCount} değerlendirme)</p>
                <div class="supplier-features">
                    ${supplier.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <button class="btn" onclick="SupplierManager.contactSupplier(${supplier.id})">İletişime Geç</button>
            </div>
        `).join('');
    },

    contactSupplier: function(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            ModalManager.showSupplierContact(supplier);
        }
    },

    filterSuppliers: function(criteria) {
        let filtered = this.suppliers;

        if (criteria.location) {
            filtered = filtered.filter(s => s.location === criteria.location);
        }

        if (criteria.maxPrice) {
            filtered = filtered.filter(s => {
                const price = parseInt(s.price.replace(/[^\d]/g, ''));
                return price <= criteria.maxPrice;
            });
        }

        if (criteria.minRating) {
            filtered = filtered.filter(s => s.rating >= criteria.minRating);
        }

        this.displaySuppliers(filtered);
    }
};

// Community Management System
const CommunityManager = {
    posts: [
        {
            id: 1,
            author: 'Ahmet K.',
            avatar: '👤',
            content: 'NFT sistemimde ilk hasadımı yaptım! 20 marul bitkisinden 3.5 kg ürün aldım. Gerçekten çok verimli! 🥬✨',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            likes: 12,
            comments: 5,
            tags: ['başarı', 'hasat', 'nft']
        },
        {
            id: 2,
            author: 'Zeynep M.',
            avatar: '👤',
            content: 'Besin çözeltisinde pH değeri sürekli yükseliyor. Bu durumla karşılaşan var mı? Çözüm önerilerinizi bekliyorum 🙏',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            likes: 8,
            comments: 15,
            tags: ['yardım', 'ph', 'sorun']
        },
        {
            id: 3,
            author: 'Mehmet Y.',
            avatar: '👤',
            content: 'Aeroponik sistemde çilek yetiştiriyorum. 2. ayımda ve sonuçlar harika! Geleneksel yöntemden %40 daha verimli 🍓',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            likes: 23,
            comments: 8,
            tags: ['başarı', 'çilek', 'aeroponik']
        }
    ],

    popularTopics: [
        { title: 'NFT sisteminde alg problemi çözümleri', views: 1250 },
        { title: 'Kışlık üretim için ışıklandırma tavsiyeleri', views: 980 },
        { title: 'Besin çözeltisi hazırlama kılavuzu', views: 756 },
        { title: 'Organik sertifikalı topraksız üretim', views: 643 }
    ],

    loadPosts: function() {
        this.displayPosts(this.posts);
        this.displayPopularTopics(this.popularTopics);
    },

    displayPosts: function(posts) {
        const container = document.querySelector('.community-posts-container');
        if (!container) return;

        container.innerHTML = posts.map(post => `
            <div class="community-post" data-post-id="${post.id}">
                <div class="community-user">
                    <div class="community-avatar" style="background: ${this.getAvatarColor(post.author)}">
                        ${post.avatar}
                    </div>
                    <div>
                        <div class="community-name">${post.author}</div>
                        <div class="community-time">${this.formatTimeAgo(post.timestamp)}</div>
                    </div>
                </div>
                <p>${post.content}</p>
                <div class="community-tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                <div class="community-actions">
                    <button onclick="CommunityManager.likePost(${post.id})">👍 ${post.likes} Beğeni</button>
                    <button onclick="CommunityManager.showComments(${post.id})">💬 ${post.comments} Yorum</button>
                    <button onclick="CommunityManager.sharePost(${post.id})">📤 Paylaş</button>
                </div>
            </div>
        `).join('');
    },

    displayPopularTopics: function(topics) {
        const container = document.querySelector('.popular-topics-container');
        if (!container) return;

        container.innerHTML = `
            <h3 style="color: #28a745; margin-bottom: 10px;">📚 Bu Hafta Popüler</h3>
            <ul style="margin-left: 20px;">
                ${topics.map(topic => `
                    <li style="margin-bottom: 8px;">
                        <a href="#" onclick="CommunityManager.viewTopic('${topic.title}')" style="color: #495057; text-decoration: none;">
                            ${topic.title} <span style="color: #6c757d;">(${topic.views} görüntüleme)</span>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    },

    createPost: function(content) {
        if (!content.trim()) {
            NotificationManager.show('Lütfen bir içerik girin.', 'warning');
            return;
        }

        const newPost = {
            id: this.posts.length + 1,
            author: userProfile.name || 'Kullanıcı',
            avatar: '👤',
            content: content,
            timestamp: new Date(),
            likes: 0,
            comments: 0,
            tags: this.extractTags(content)
        };

        this.posts.unshift(newPost);
        this.displayPosts(this.posts);
        
        NotificationManager.show('Gönderiniz başarıyla paylaşıldı! 🎉', 'success');
        
        // Clear the textarea
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.value = '';
        }
    },

    likePost: function(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            this.displayPosts(this.posts);
            NotificationManager.show('Beğeni eklendi! 👍', 'success');
        }
    },

    showComments: function(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            ModalManager.showComments(post);
        }
    },

    sharePost: function(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (navigator.share) {
                navigator.share({
                    title: 'AgroGuide - Topluluk Paylaşımı',
                    text: post.content,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(post.content);
                NotificationManager.show('Gönderi panoya kopyalandı! 📋', 'success');
            }
        }
    },

    viewTopic: function(topicTitle) {
        NotificationManager.show(`"${topicTitle}" konusu açılıyor...`, 'info');
        // Here you would typically navigate to a detailed topic view
    },

    extractTags: function(content) {
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        return matches ? matches.map(tag => tag.substring(1)) : [];
    },

    formatTimeAgo: function(date) {
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) {
            return 'Az önce';
        } else if (diffInHours < 24) {
            return `${diffInHours} saat önce`;
        } else if (diffInDays < 7) {
            return `${diffInDays} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    },

    getAvatarColor: function(name) {
        const colors = ['#28a745', '#dc3545', '#007bff', '#ffc107', '#6f42c1', '#20c997'];
        const index = name.length % colors.length;
        return colors[index];
    }
};

// Modal Management System
const ModalManager = {
    currentModal: null,

    show: function(modalId, data = null) {
        this.close(); // Close any existing modal
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            this.currentModal = modalId;
            
            if (data) {
                this.populateModal(modalId, data);
            }
        }
    },

    close: function() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) {
                modal.style.display = 'none';
            }
            this.currentModal = null;
        }
        
        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    },

    showRecommendation: function(recommendation) {
        const modal = document.getElementById('system-recommendation-modal');
        if (modal) {
            const content = modal.querySelector('#recommendation-content');
            if (content) {
                content.innerHTML = `
                    <div class="recommendation-header">
                        <h4>${recommendation.system}</h4>
                        <span class="difficulty-badge ${recommendation.difficulty.toLowerCase()}">${recommendation.difficulty}</span>
                    </div>
                    <p><strong>Sebep:</strong> ${recommendation.reason}</p>
                    <p><strong>Tahmini Maliyet:</strong> ${recommendation.cost}</p>
                    <p><strong>Beklenen Verim:</strong> ${recommendation.yield}</p>
                    <p><strong>Su Tasarrufu:</strong> ${recommendation.waterSaving}</p>
                    <div class="advantages">
                        <strong>Avantajlar:</strong>
                        <ul>
                            ${recommendation.advantages.map(adv => `<li>${adv}</li>`).join('')}
                        </ul>
                    </div>
                    ${recommendation.disadvantages.length ? `
                        <div class="disadvantages">
                            <strong>Dikkat Edilecekler:</strong>
                            <ul>
                                ${recommendation.disadvantages.map(dis => `<li>${dis}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
            }
            this.show('system-recommendation-modal');
        }
    },

    showSupplierContact: function(supplier) {
        const modalContent = `
            <div class="supplier-contact-modal">
                <h3>📞 ${supplier.name}</h3>
                <p><strong>Konum:</strong> ${supplier.location}</p>
                <p><strong>Telefon:</strong> ${supplier.phone}</p>
                <p><strong>E-posta:</strong> ${supplier.contact}</p>
                <p><strong>Ürünler:</strong> ${supplier.products.join(', ')}</p>
                <p><strong>Fiyat:</strong> ${supplier.price}</p>
                <div class="contact-actions">
                    <button class="btn" onclick="ModalManager.callSupplier('${supplier.phone}')">📞 Ara</button>
                    <button class="btn btn-secondary" onclick="ModalManager.emailSupplier('${supplier.contact}')">✉️ E-posta</button>
                </div>
            </div>
        `;
        
        this.showCustomModal('Tedarikçi İletişim', modalContent);
    },

    showComments: function(post) {
        const comments = this.generateSampleComments(post.comments);
        const modalContent = `
            <div class="comments-modal">
                <h3>💬 Yorumlar</h3>
                <div class="original-post">
                    <strong>${post.author}:</strong> ${post.content}
                </div>
                <div class="comments-list">
                    ${comments.map(comment => `
                        <div class="comment">
                            <strong>${comment.author}:</strong> ${comment.content}
                            <span class="comment-time">${this.formatTimeAgo(comment.timestamp)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="add-comment">
                    <textarea placeholder="Yorumunuzu yazın..." id="new-comment"></textarea>
                    <button class="btn" onclick="ModalManager.addComment(${post.id})">Yorum Yap</button>
                </div>
            </div>
        `;
        
        this.showCustomModal('Yorumlar', modalContent);
    },

    showCustomModal: function(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="ModalManager.close()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Auto-remove after closing
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300000); // Remove after 5 minutes
    },

    callSupplier: function(phone) {
        if (navigator.userAgent.includes('Mobile')) {
            window.location.href = `tel:${phone}`;
        } else {
            NotificationManager.show(`Telefon numarası: ${phone}`, 'info');
        }
    },

    emailSupplier: function(email) {
        window.location.href = `mailto:${email}?subject=AgroGuide Üzerinden İletişim&body=Merhaba,%0A%0AAgroGuide uygulaması üzerinden size ulaşıyorum.`;
    },

    addComment: function(postId) {
        const textarea = document.getElementById('new-comment');
        if (textarea && textarea.value.trim()) {
            const post = CommunityManager.posts.find(p => p.id === postId);
            if (post) {
                post.comments++;
                NotificationManager.show('Yorumunuz eklendi! 💬', 'success');
                this.close();
                CommunityManager.displayPosts(CommunityManager.posts);
            }
        }
    },

    generateSampleComments: function(count) {
        const sampleComments = [
            { author: 'Ali K.', content: 'Çok faydalı bilgi, teşekkürler!' },
            { author: 'Fatma S.', content: 'Ben de aynı sorunu yaşamıştım, pH düşürücü kullanarak çözdüm.' },
            { author: 'Mehmet A.', content: 'Hangi besin çözeltisini kullanıyorsunuz?' },
            { author: 'Ayşe T.', content: 'Çok güzel sonuçlar, tebrikler!' },
            { author: 'Can Y.', content: 'Bu konuda daha detaylı bilgi alabilir miyim?' }
        ];
        
        return sampleComments.slice(0, count).map(comment => ({
            ...comment,
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        }));
    },

    populateModal: function(modalId, data) {
        // Generic modal population logic
        const modal = document.getElementById(modalId);
        if (modal && data) {
            Object.keys(data).forEach(key => {
                const element = modal.querySelector(`[data-field="${key}"]`);
                if (element) {
                    element.textContent = data[key];
                }
            });
        }
    }
};

// Notification Management System
const NotificationManager = {
    notifications: [],
    maxNotifications: 5,

    show: function(message, type = 'info', duration = 3000) {
        const notification = this.create(message, type);
        document.body.appendChild(notification);
        
        // Store notification
        this.notifications.push({
            id: Utils.generateId(),
            message,
            type,
            timestamp: new Date()
        });
        
        // Limit notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(-this.maxNotifications);
        }
        
        // Auto-remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);
    },

    create: function(message, type) {
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="NotificationManager.remove(this.parentElement.parentElement)">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
        `;
        
        return notification;
    },

    remove: function(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    },

    getIcon: function(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },

    getColor: function(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    },

    clear: function() {
        document.querySelectorAll('.notification-toast').forEach(notification => {
            this.remove(notification);
        });
        this.notifications = [];
    }
};

// Weather and Environmental Data
const WeatherManager = {
    data: {
        temperature: 22,
        humidity: 65,
        light: 'Yeterli',
        season: 'İlkbahar'
    },

    getRecommendations: function() {
        const recommendations = [];
        
        if (this.data.temperature < 18) {
            recommendations.push('🌡️ Sıcaklık düşük, ısıtma sistemi kullanın');
        } else if (this.data.temperature > 26) {
            recommendations.push('🌡️ Sıcaklık yüksek, havalandırma arttırın');
        }
        
        if (this.data.humidity > 70) {
            recommendations.push('💧 Nem oranı yüksek, havalandırmayı kontrol edin');
        } else if (this.data.humidity < 50) {
            recommendations.push('💧 Nem oranı düşük, nemlendirim gerekebilir');
        }
        
        return recommendations;
    },

    updateEnvironmentalData: function() {
        // Simulate environmental data updates
        this.data.temperature += (Math.random() - 0.5) * 2;
        this.data.humidity += (Math.random() - 0.5) * 10;
        
        // Keep within realistic ranges
        this.data.temperature = Math.max(15, Math.min(30, this.data.temperature));
        this.data.humidity = Math.max(30, Math.min(80, this.data.humidity));
    }
};

// Event Handlers and Initialization
const EventHandlers = {
    init: function() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupKeyboardShortcuts();
        this.setupSwipeGestures();
    },

    setupNavigation: function() {
        // Bottom navigation
        document.querySelectorAll('.bottom-nav-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                const screens = ['home-screen', 'guide-screen', 'production-screen', 'community-screen'];
                ScreenManager.showScreen(screens[index]);
            });
        });

        // Browser back button
        window.addEventListener('popstate', () => {
            ScreenManager.goBack();
        });
    },

    setupModals: function() {
        // Close modals when clicking outside
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                ModalManager.close();
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                ModalManager.close();
            }
        });
    },

    setupForms: function() {
        // Form validation
        document.addEventListener('submit', (event) => {
            event.preventDefault();
            const form = event.target;
            this.validateForm(form);
        });

        // Auto-save form data
        document.addEventListener('input', Utils.debounce((event) => {
            if (event.target.classList.contains('form-control')) {
                this.autoSaveFormData(event.target);
            }
        }, 1000));
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + Number keys for quick navigation
            if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '4') {
                event.preventDefault();
                const screens = ['home-screen', 'guide-screen', 'production-screen', 'community-screen'];
                const screenIndex = parseInt(event.key) - 1;
                if (screens[screenIndex]) {
                    ScreenManager.showScreen(screens[screenIndex]);
                }
            }
        });
    },

    setupSwipeGestures: function() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        });

        document.addEventListener('touchend', (event) => {
            const endX = event.changedTouches[0].clientX;
            const endY = event.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next screen
                    this.navigateToNextScreen();
                } else {
                    // Swipe right - previous screen
                    this.navigateToPreviousScreen();
                }
            }
        });
    },

    navigateToNextScreen: function() {
        const screens = ['home-screen', 'guide-screen', 'production-screen', 'community-screen'];
        const currentIndex = screens.indexOf(ScreenManager.currentScreen);
        const nextIndex = (currentIndex + 1) % screens.length;
        ScreenManager.showScreen(screens[nextIndex]);
    },

    navigateToPreviousScreen: function() {
        const screens = ['home-screen', 'guide-screen', 'production-screen', 'community-screen'];
        const currentIndex = screens.indexOf(ScreenManager.currentScreen);
        const prevIndex = currentIndex === 0 ? screens.length - 1 : currentIndex - 1;
        ScreenManager.showScreen(screens[prevIndex]);
    },

    validateForm: function(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Bu alan gereklidir');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        return isValid;
    },

    showFieldError: function(field, message) {
        field.classList.add('error');
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    },

    clearFieldError: function(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    },

    autoSaveFormData: function(field) {
        const formData = Utils.loadFromStorage('formData') || {};
        formData[field.name || field.id] = field.value;
        Utils.saveToStorage('formData', formData);
    }
};

// Performance Monitoring
const PerformanceMonitor = {
    metrics: {
        loadTime: 0,
        interactionTime: 0,
        memoryUsage: 0
    },

    init: function() {
        this.measureLoadTime();
        this.monitorInteractions();
        this.monitorMemory();
    },

    measureLoadTime: function() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`App loaded in ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    },

    monitorInteractions: function() {
        document.addEventListener('click', () => {
            this.metrics.interactionTime = performance.now();
        });
    },

    monitorMemory: function() {
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            }, 30000); // Check every 30 seconds
        }
    },

    getReport: function() {
        return {
            loadTime: `${this.metrics.loadTime.toFixed(2)}ms`,
            memoryUsage: `${this.metrics.memoryUsage.toFixed(2)}MB`,
            timestamp: new Date().toISOString()
        };
    }
};

// Main Application Logic
const AgroGuideApp = {
    version: '1.0.0',
    initialized: false,

    init: function() {
        if (this.initialized) return;

        console.log(`🌱 AgroGuide v${this.version} initializing...`);

        // Initialize all managers
        EventHandlers.init();
        PerformanceMonitor.init();
        
        // Load saved data
        this.loadSavedData();
        
        // Setup periodic tasks
        this.setupPeriodicTasks();
        
        // Show welcome message
        this.showWelcomeMessage();

        this.initialized = true;
        console.log('✅ AgroGuide initialized successfully');
    },

    loadSavedData: function() {
        // Load user profile
        ProfileManager.loadProfile();
        
        // Load selected system
        SystemManager.loadSelectedSystem();
        
        // Load production data
        const savedProductionData = Utils.loadFromStorage('productionData');
        if (savedProductionData) {
            ProductionTracker.data = { ...ProductionTracker.data, ...savedProductionData };
        }
    },

    setupPeriodicTasks: function() {
        // Update environmental data every 5 minutes
        setInterval(() => {
            WeatherManager.updateEnvironmentalData();
        }, 5 * 60 * 1000);

        // Update production display every 10 seconds when on production screen
        setInterval(() => {
            if (ScreenManager.currentScreen === 'production-screen') {
                ProductionTracker.updateDisplay();
            }
        }, 10000);

        // Show random tips every 2 minutes
        setInterval(() => {
            this.showRandomTip();
        }, 2 * 60 * 1000);
    },

    showWelcomeMessage: function() {
        setTimeout(() => {
            if (!Utils.loadFromStorage('hasSeenWelcome')) {
                NotificationManager.show('🌱 AgroGuide\'a hoş geldiniz! Topraksız tarım yolculuğunuza başlayalım.', 'success', 5000);
                Utils.saveToStorage('hasSeenWelcome', true);
            }
        }, 1000);
    },

    showRandomTip: function() {
        const tips = [
            '💡 pH değerini günde 2 kez kontrol etmeyi unutmayın!',
            '🌡️ Gece sıcaklığı 18°C\'nin altına inmemeli.',
            '💧 Su seviyesini her gün kontrol edin.',
            '🌱 Yeni fideleri dikerken kökleri zarar vermemeye dikkat edin.',
            '⚡ Elektrik kesintisi için yedek pompa bulundurun.',
            '🌿 Hasada yakın bitkilerde besin konsantrasyonunu azaltın.'
        ];

        if (Math.random() < 0.3 && ScreenManager.currentScreen !== 'home-screen') {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            NotificationManager.show(randomTip, 'info', 4000);
        }
    },

    exportAllData: function() {
        const exportData = {
            version: this.version,
            userProfile: userProfile,
            selectedSystem: selectedSystemType,
            productionData: ProductionTracker.data,
            appState: AppState,
            exportDate: new Date().toISOString(),
            performance: PerformanceMonitor.getReport()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `agroguide_full_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        NotificationManager.show('📊 Tüm veriler başarıyla dışa aktarıldı!', 'success');
    },

    resetApp: function() {
        if (confirm('Tüm veriler silinecek. Emin misiniz?')) {
            // Clear all localStorage data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('agroguide_')) {
                    localStorage.removeItem(key);
                }
            });

            // Reset global variables
            userProfile = {};
            selectedSystemType = 'nft';
            currentStep = 1;
            productionData = {
                startDate: new Date(),
                waterLevel: 80,
                phLevel: 6.2,
                plantCount: 18,
                systemUptime: 24,
                notifications: []
            };

            // Reset app state
            AppState.user.isLoggedIn = false;
            AppState.user.profile = {};
            AppState.system.selected = null;
            AppState.system.installed = false;
            AppState.production.active = false;

            NotificationManager.show('🔄 Uygulama sıfırlandı!', 'success');
            
            // Reload the page
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }
};

// Global Functions (for HTML onclick handlers)
function showScreen(screenId) {
    ScreenManager.showScreen(screenId);
}

function analyzeProfile() {
    ProfileManager.createProfile();
}

function selectSystem(systemType) {
    SystemManager.selectSystem(systemType);
}

function nextStep() {
    GuideManager.nextStep();
}

function previousStep() {
    GuideManager.previousStep();
}

function acceptRecommendation() {
    const modal = document.getElementById('system-recommendation-modal');
    const systemType = modal.querySelector('[data-system-type]')?.getAttribute('data-system-type') || 'nft';
    selectedSystemType = systemType;
    ModalManager.close();
    ScreenManager.showScreen('systems-screen');
}

function closeModal() {
    ModalManager.close();
}

function showModal(modalId, message = '') {
    if (message) {
        const messageElement = document.getElementById('modal-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    ModalManager.show(modalId);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here
        console.log('Service Worker support detected');
    });
}

// PWA Features
const PWAFeatures = {
    isStandalone: function() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    },

    canInstall: function() {
        return !this.isStandalone() && 'serviceWorker' in navigator;
    },

    showInstallPrompt: function() {
        if (this.canInstall()) {
            const installBanner = document.createElement('div');
            installBanner.className = 'install-banner';
            installBanner.innerHTML = `
                <div class="install-content">
                    <span>📱 AgroGuide'ı ana ekranınıza ekleyin!</span>
                    <button onclick="PWAFeatures.hideInstallPrompt()" class="install-close">×</button>
                </div>
            `;
            installBanner.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 0;
                right: 0;
                background: #28a745;
                color: white;
                padding: 15px;
                text-align: center;
                z-index: 999;
                animation: slideUp 0.3s ease;
            `;
            
            document.body.appendChild(installBanner);
        }
    },

    hideInstallPrompt: function() {
        const banner = document.querySelector('.install-banner');
        if (banner) {
            banner.remove();
        }
    }
};

// Accessibility Features
const AccessibilityManager = {
    init: function() {
        this.setupKeyboardNavigation();
        this.setupScreenReader();
        this.setupHighContrast();
    },

    setupKeyboardNavigation: function() {
        // Tab navigation for cards
        document.querySelectorAll('.feature-card, .system-card, .supplier-card').forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    card.click();
                }
            });
        });
    },

    setupScreenReader: function() {
        // Add ARIA labels
        document.querySelectorAll('.feature-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent;
            const description = card.querySelector('p')?.textContent;
            if (title && description) {
                card.setAttribute('aria-label', `${title}: ${description}`);
            }
        });
    },

    setupHighContrast: function() {
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addListener((e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }
};

// Analytics and Tracking
const AnalyticsManager = {
    events: [],
    
    track: function(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            screen: ScreenManager.currentScreen,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };
        
        this.events.push(event);
        console.log('Event tracked:', event);
        
        // Keep only last 100 events
        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }
        
        Utils.saveToStorage('analytics', this.events);
    },

    getSessionId: function() {
        let sessionId = sessionStorage.getItem('agroguide_session');
        if (!sessionId) {
            sessionId = Utils.generateId();
            sessionStorage.setItem('agroguide_session', sessionId);
        }
        return sessionId;
    },

    getReport: function() {
        const screenViews = {};
        const userActions = {};
        
        this.events.forEach(event => {
            if (event.name === 'screen_view') {
                screenViews[event.properties.screen] = (screenViews[event.properties.screen] || 0) + 1;
            } else {
                userActions[event.name] = (userActions[event.name] || 0) + 1;
            }
        });
        
        return {
            totalEvents: this.events.length,
            screenViews,
            userActions,
            sessionDuration: this.getSessionDuration()
        };
    },

    getSessionDuration: function() {
        if (this.events.length > 0) {
            const firstEvent = new Date(this.events[0].timestamp);
            const lastEvent = new Date(this.events[this.events.length - 1].timestamp);
            return Math.round((lastEvent - firstEvent) / 1000 / 60); // minutes
        }
        return 0;
    }
};

// Error Handling and Logging
const ErrorManager = {
    errors: [],
    
    init: function() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason.message || 'Unhandled Promise Rejection',
                stack: event.reason.stack
            });
        });
    },

    logError: function(error) {
        const errorLog = {
            ...error,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: ScreenManager.currentScreen,
            userProfile: userProfile.id || 'anonymous'
        };
        
        this.errors.push(errorLog);
        console.error('Error logged:', errorLog);
        
        // Show user-friendly error message
        NotificationManager.show('Bir hata oluştu. Lütfen sayfayı yenileyin.', 'error');
        
        // Keep only last 50 errors
        if (this.errors.length > 50) {
            this.errors = this.errors.slice(-50);
        }
        
        Utils.saveToStorage('errors', this.errors);
    },

    getReport: function() {
        return {
            totalErrors: this.errors.length,
            recentErrors: this.errors.slice(-10),
            errorTypes: this.groupErrorsByType()
        };
    },

    groupErrorsByType: function() {
        const types = {};
        this.errors.forEach(error => {
            types[error.type] = (types[error.type] || 0) + 1;
        });
        return types;
    }
};

// Offline Support
const OfflineManager = {
    isOnline: navigator.onLine,
    
    init: function() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onOnline();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onOffline();
        });
    },

    onOnline: function() {
        NotificationManager.show('🌐 İnternet bağlantısı restore edildi!', 'success');
        this.syncPendingData();
    },

    onOffline: function() {
        NotificationManager.show('📴 İnternet bağlantısı kesildi. Çevrimdışı modda çalışıyorsunuz.', 'warning', 5000);
    },

    syncPendingData: function() {
        // Sync any pending data when back online
        const pendingData = Utils.loadFromStorage('pendingSync');
        if (pendingData && pendingData.length > 0) {
            console.log('Syncing pending data:', pendingData);
            // Here you would send data to server
            Utils.saveToStorage('pendingSync', []);
        }
    },

    addToPendingSync: function(data) {
        const pending = Utils.loadFromStorage('pendingSync') || [];
        pending.push({
            data: data,
            timestamp: new Date().toISOString()
        });
        Utils.saveToStorage('pendingSync', pending);
    }
};

// Internationalization Support
const I18nManager = {
    currentLanguage: 'tr',
    translations: {
        tr: {
            welcome: 'Hoş Geldiniz',
            profile: 'Profil',
            systems: 'Sistemler',
            guide: 'Rehber',
            production: 'Üretim',
            community: 'Topluluk',
            suppliers: 'Tedarikçiler'
        },
        en: {
            welcome: 'Welcome',
            profile: 'Profile',
            systems: 'Systems',
            guide: 'Guide',
            production: 'Production',
            community: 'Community',
            suppliers: 'Suppliers'
        }
    },

    translate: function(key) {
        return this.translations[this.currentLanguage][key] || key;
    },

    setLanguage: function(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            Utils.saveToStorage('language', language);
            this.updateUI();
        }
    },

    updateUI: function() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });
    },

    init: function() {
        const savedLanguage = Utils.loadFromStorage('language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
        }
        this.updateUI();
    }
};

// Theme Manager
const ThemeManager = {
    currentTheme: 'light',
    
    init: function() {
        const savedTheme = Utils.loadFromStorage('theme') || 'light';
        this.setTheme(savedTheme);
        this.detectSystemTheme();
    },

    setTheme: function(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        Utils.saveToStorage('theme', theme);
    },

    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    detectSystemTheme: function() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        }

        // Listen for changes
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing AgroGuide...');
    
    // Initialize managers
    ErrorManager.init();
    OfflineManager.init();
    AccessibilityManager.init();
    ThemeManager.init();
    I18nManager.init();
    
    // Initialize main app
    AgroGuideApp.init();
    
    // Track page load
    AnalyticsManager.track('app_loaded', {
        version: AgroGuideApp.version,
        timestamp: new Date().toISOString()
    });
    
    // Show install prompt after 30 seconds
    setTimeout(() => {
        PWAFeatures.showInstallPrompt();
    }, 30000);
});

// Track screen views
const originalShowScreen = ScreenManager.showScreen;
ScreenManager.showScreen = function(screenId, addToHistory = true) {
    originalShowScreen.call(this, screenId, addToHistory);
    AnalyticsManager.track('screen_view', { screen: screenId });
};

// Global error handler for debugging
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false; // Let default handler run too
};

// Export for global access
window.AgroGuide = {
    app: AgroGuideApp,
    screens: ScreenManager,
    profile: ProfileManager,
    systems: SystemManager,
    production: ProductionTracker,
    community: CommunityManager,
    suppliers: SupplierManager,
    utils: Utils,
    analytics: AnalyticsManager,
    errors: ErrorManager
};

console.log('📱 AgroGuide JavaScript loaded successfully!');