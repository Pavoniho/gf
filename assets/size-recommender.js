(function () {
  if (window.inshapeSizeRecommenderInitialized) return;
  window.inshapeSizeRecommenderInitialized = true;

  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

  function normalizeSize(size) {
    if (size === 'XS') return 'S';
    if (size === '4XL') return '3XL';
    return size;
  }

  function getOneSizeDown(size) {
    const i = SIZE_ORDER.indexOf(size);
    return i > 0 ? SIZE_ORDER[i - 1] : size;
  }

  function calculateRecommendedSize(usualSize, goal) {
    const normalized = normalizeSize(usualSize);
    let recommendedSize = normalized;

    const isXSNormalized = usualSize === 'XS' && normalized === 'S';
    const is4xlNormalized = usualSize === '4XL' && normalized === '3XL';

    let reason = '';

    /* FLATTEN THE STOMACH — Aggressive compression */
    if (goal === 'Flatten the Stomach') {
      recommendedSize = getOneSizeDown(normalized);
      if (usualSize === 'XS' || normalized === 'S') recommendedSize = 'S';
      if (usualSize === '4XL') recommendedSize = '3XL';
      reason =
        'To flatten the stomach and create a slimmer profile, we recommend sizing down for maximum compression.';
    }
    /* COMPRESS LOOSE SKIN — Controlled compression */
    else if (goal === 'Compress Loose Skin') {
      recommendedSize = normalized;
      reason =
        'For loose or sagging skin, your usual size provides firm support without excessive tightness.';
    }
    /* CONCEAL CHEST INSECURITIES — Neutral sizing */
    else if (goal === 'Conceal Chest Insecurities') {
      recommendedSize = normalized;
      reason =
        'Your usual size provides discreet chest compression and helps restore confidence under clothing.';
    }
    /* BACK SUPPORT — Neutral sizing */
    else if (goal === 'Back Support') {
      recommendedSize = normalized;
      reason =
        'Your usual size offers balanced support to improve posture and core stability.';
    }

    /* XS NORMALIZATION */
    if (isXSNormalized) {
      recommendedSize = 'S';
      reason =
        'You selected XS — we don’t offer XS yet. S is our smallest size and provides the best fit available.';
    }
    /* 4XL NORMALIZATION */
    if (is4xlNormalized) {
      recommendedSize = '3XL';
      reason =
        'You selected 4XL — we don’t offer 4XL yet. 3XL is our stretchiest fit and comfortably supports many 4XL customers.';
    }
    /* S + FLATTEN STOMACH GUARD */
    if (usualSize === 'S' && goal === 'Flatten the Stomach') {
      recommendedSize = 'S';
      reason =
        'You selected S — this is already a snug fit. We recommend staying with S for strong compression without unnecessary tightness.';
    }

    return { size: recommendedSize, reason };
  }

  class SizeRecommender {
    constructor() {
      this.activeTrigger = null;
      this.selectedSize = null;
      this.selectedGoal = null;
      this.recommendation = null;
      this.lastTriggerAt = 0;
      this.modal = document.getElementById('srzModal');
      // Move the modal to <body> so its fixed positioning escapes any product
      // column that uses overflow:hidden / transform / sticky (which would trap it).
      if (this.modal && this.modal.parentNode !== document.body) {
        document.body.appendChild(this.modal);
      }
      this.bind();
    }

    openFromTrigger(trigger, event) {
      if (!trigger) return;
      const now = Date.now();
      if (now - this.lastTriggerAt < 500) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        return;
      }
      this.lastTriggerAt = now;
      if (event) { event.preventDefault(); event.stopPropagation(); }
      this.activeTrigger = trigger;
      this.reset();
      this.open();
    }

    bind() {
      document.addEventListener(
        'touchend',
        (event) => {
          const trigger = event.target.closest('[data-size-recommender-trigger]');
          if (!trigger) return;
          this.openFromTrigger(trigger, event);
        },
        { capture: true, passive: false }
      );

      document.addEventListener(
        'pointerup',
        (event) => {
          if (event.pointerType === 'mouse') return;
          const trigger = event.target.closest('[data-size-recommender-trigger]');
          if (!trigger) return;
          this.openFromTrigger(trigger, event);
        },
        true
      );

      document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-size-recommender-trigger]');
        if (trigger) { this.openFromTrigger(trigger, event); return; }

        if (event.target.closest('[data-srz-close]')) {
          event.preventDefault();
          this.close();
          return;
        }

        const sizeBtn = event.target.closest('.srz-size-btn');
        if (sizeBtn && this.modal.contains(sizeBtn)) {
          event.preventDefault();
          this.selectedSize = sizeBtn.dataset.size;
          this.go(2);
          return;
        }

        const goalBtn = event.target.closest('.srz-goal-btn');
        if (goalBtn && this.modal.contains(goalBtn)) {
          event.preventDefault();
          this.selectedGoal = goalBtn.dataset.goal;
          this.recommendation = calculateRecommendedSize(this.selectedSize, this.selectedGoal);
          this.showResult();
          this.go(3);
          return;
        }

        if (event.target.closest('[data-srz-apply]')) {
          event.preventDefault();
          if (!this.recommendation) return;
          const applied = this.applyVariantToThemePicker();
          this.saveProperties();
          this.toast(
            applied
              ? '✓ Size ' + this.recommendation.size + ' selected on product'
              : '✓ Saved ' + this.recommendation.size + ' (picker not found)'
          );
          this.close();
          return;
        }

        if (event.target.closest('[data-srz-startover]')) {
          event.preventDefault();
          this.reset();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('srz-is-active')) {
          this.close();
        }
      });
    }

    reset() {
      this.selectedSize = null;
      this.selectedGoal = null;
      this.recommendation = null;
      this.go(1);
    }

    getScope() {
      return (
        this.activeTrigger?.closest('.shopify-section') ||
        this.activeTrigger?.closest('section') ||
        document
      );
    }

    open() {
      if (!this.modal) return;
      this.modal.classList.add('srz-is-active');
      setTimeout(() => this.modal.classList.add('srz-is-show'), 10);
      document.body.style.overflow = 'hidden';
    }

    close() {
      if (!this.modal) return;
      this.modal.classList.remove('srz-is-show');
      setTimeout(() => {
        this.modal.classList.remove('srz-is-active');
        document.body.style.overflow = '';
      }, 300);
    }

    go(step) {
      if (!this.modal) return;
      this.modal.querySelectorAll('[data-srz-step]').forEach((el) => {
        el.classList.toggle('srz-is-active', parseInt(el.dataset.srzStep, 10) === step);
      });
      this.updateProgress(step);
    }

    updateProgress(step) {
      if (!this.modal) return;
      this.modal.querySelectorAll('.srz-progress-step').forEach((el) => {
        const s = parseInt(el.dataset.step, 10);
        el.classList.remove('srz-is-active', 'srz-is-completed');
        if (s < step) el.classList.add('srz-is-completed');
        else if (s === step) el.classList.add('srz-is-active');
      });
      this.modal.querySelectorAll('.srz-progress-line').forEach((el) => {
        el.classList.toggle('srz-is-completed', parseInt(el.dataset.line, 10) < step);
      });
    }

    showResult() {
      const result = this.modal.querySelector('[data-srz-result]');
      const details = this.modal.querySelector('[data-srz-details]');
      if (result) result.textContent = this.recommendation.size;
      if (details) details.textContent = this.recommendation.reason;
    }

    applyVariantToThemePicker() {
      const size = this.recommendation?.size;
      if (!size) return false;

      const scope = this.getScope();

      const fieldsets = Array.from(scope.querySelectorAll('fieldset'));
      const sizeFieldset = fieldsets.find((fs) => {
        const legend = fs.querySelector('legend');
        const txt = (
          legend?.textContent ||
          fs.getAttribute('data-option-name') ||
          fs.getAttribute('data-index') ||
          ''
        ).toLowerCase();
        return txt.includes('size');
      });

      if (sizeFieldset) {
        const labels = Array.from(sizeFieldset.querySelectorAll('label'));
        const labelMatch = labels.find((l) => (l.textContent || '').trim() === size);
        if (labelMatch) { labelMatch.click(); return true; }
      }

      const selects = Array.from(scope.querySelectorAll('select'));
      for (const sel of selects) {
        const opt = Array.from(sel.options).find(
          (o) => o.value === size || (o.text || '').trim() === size
        );
        if (opt) {
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }

      return false;
    }

    saveProperties() {
      const scope = this.getScope();
      const form =
        scope.querySelector('form[action*="/cart/add"]') ||
        document.querySelector('form[action*="/cart/add"]');

      if (!form) return;

      form.querySelectorAll('[data-inshape]').forEach((e) => e.remove());

      const add = (name, value) => {
        const i = document.createElement('input');
        i.type = 'hidden';
        i.name = 'properties[' + name + ']';
        i.value = value;
        i.dataset.inshape = 'true';
        form.appendChild(i);
      };

      add('_inshape_recommended_size', this.recommendation.size);
      add(
        '_inshape_size_recommender_data',
        JSON.stringify({
          usual: this.selectedSize,
          normalized: normalizeSize(this.selectedSize),
          goal: this.selectedGoal,
          recommended: this.recommendation.size,
          time: new Date().toISOString()
        })
      );
    }

    toast(text) {
      const t = document.createElement('div');
      t.textContent = text;
      t.style.cssText =
        'position:fixed;top:20px;right:20px;background:#22c55e;color:#fff;' +
        'padding:14px 20px;border-radius:8px;font-weight:600;z-index:1000000;' +
        'box-shadow:0 10px 24px rgba(0,0,0,.18);animation:srzSlideIn 0.3s ease;';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SizeRecommender());
  } else {
    new SizeRecommender();
  }
})();
