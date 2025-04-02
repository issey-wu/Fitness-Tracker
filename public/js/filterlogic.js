// Enhanced Filter Logic for Fitness Tracker (All Dates)
document.addEventListener('DOMContentLoaded', () => {
    // Get data from localStorage
    const getData = () => JSON.parse(localStorage.getItem('workoutData') || '{}');
    
    // Track current filter state
    let currentFilter = {
      type: null,
      value: null
    };
    
    // Populate filter dropdowns based on localStorage data
    function populateFilterDropdowns() {
      console.log('Populating filter dropdowns');
      const data = getData();
      if (!data) return;
      
      // Populate Category Filter Menu
      const categoryMenu = document.getElementById('filterCategoryMenu');
      if (!categoryMenu) {
        console.error('Category menu element not found');
        return;
      }
      
      categoryMenu.innerHTML = '';
      Object.keys(data).forEach(category => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.textContent = category;
        a.setAttribute('data-filter-type', 'category');
        a.setAttribute('data-filter-value', category);
        a.addEventListener('click', applyFilter);
        li.appendChild(a);
        categoryMenu.appendChild(li);
      });
      
      // Populate Movement Filter Menu
      const movementMenu = document.getElementById('filterMovementMenu');
      if (!movementMenu) {
        console.error('Movement menu element not found');
        return;
      }
      
      movementMenu.innerHTML = '';
      const allMovements = new Set();
      
      // Collect all unique movements across categories
      Object.values(data).forEach(categoryData => {
        if (categoryData && categoryData.movements) {
          Object.keys(categoryData.movements).forEach(movement => {
            allMovements.add(movement);
          });
        }
      });
      
      // Add movements to filter menu
      allMovements.forEach(movement => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.textContent = movement;
        a.setAttribute('data-filter-type', 'movement');
        a.setAttribute('data-filter-value', movement);
        a.addEventListener('click', applyFilter);
        li.appendChild(a);
        movementMenu.appendChild(li);
      });
      
      // Populate Muscle Focus Filter Menu
      const muscleMenu = document.getElementById('filterMuscleMenu');
      if (!muscleMenu) {
        console.error('Muscle focus menu element not found');
        return;
      }
      
      muscleMenu.innerHTML = '';
      const allMuscleFocus = new Set();
      
      // Collect all unique muscle focus options across all movements and categories
      Object.values(data).forEach(categoryData => {
        if (categoryData && categoryData.movements) {
          Object.values(categoryData.movements).forEach(muscleFocusArray => {
            if (Array.isArray(muscleFocusArray)) {
              muscleFocusArray.forEach(muscleFocus => {
                allMuscleFocus.add(muscleFocus);
              });
            }
          });
        }
      });
      
      // Add muscle focus options to filter menu
      allMuscleFocus.forEach(muscleFocus => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = '#';
        a.textContent = muscleFocus;
        a.setAttribute('data-filter-type', 'muscle-focus');
        a.setAttribute('data-filter-value', muscleFocus);
        a.addEventListener('click', applyFilter);
        li.appendChild(a);
        muscleMenu.appendChild(li);
      });
    }
    
    // Apply filter when a dropdown item is clicked
    function applyFilter(event) {
      event.preventDefault();
      event.stopPropagation();
      
      const filterType = this.getAttribute('data-filter-type');
      const filterValue = this.getAttribute('data-filter-value');
      
      console.log(`Applying filter: ${filterType} = ${filterValue}`);
      
      // Save current filter state
      currentFilter = {
        type: filterType,
        value: filterValue
      };
      
      // Update the navbar to show which filter is applied
      const filterDropdown = document.getElementById('filterDropdown');
      filterDropdown.textContent = `Filter: ${filterValue}`;
      filterDropdown.classList.add('active');
      
      // Determine if we should filter the current page or fetch all matching workouts
      const movementBlocks = document.querySelectorAll('.movement-block');
      const currentWorkouts = movementBlocks.length > 0;
      
      if (currentWorkouts) {
        // We have workouts on the current page, filter them
        filterCurrentWorkouts(filterType, filterValue);
      } else {
        // No workouts on current page, fetch all matching workouts
        fetchAllFilteredWorkouts(filterType, filterValue);
      }
      
      // Close any open dropdown menus
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
      
      // Add a "Clear Filter" option to the navbar
      addClearFilterOption();
    }
    
    // Filter workouts on the current page
    function filterCurrentWorkouts(filterType, filterValue) {
      const movementBlocks = document.querySelectorAll('.movement-block');
      console.log(`Found ${movementBlocks.length} movement blocks to filter`);
      
      let visibleCount = 0;
      
      movementBlocks.forEach(block => {
        const blockCategory = block.getAttribute('data-category');
        const blockMovement = block.getAttribute('data-movement');
        const blockMuscleFocus = block.getAttribute('data-muscle-focus');
        
        let shouldShow = true;
        
        if (filterType === 'category' && blockCategory !== filterValue) {
          shouldShow = false;
        } else if (filterType === 'movement' && blockMovement !== filterValue) {
          shouldShow = false;
        } else if (filterType === 'muscle-focus' && blockMuscleFocus !== filterValue) {
          shouldShow = false;
        }
        
        // Find the nearest parent form and hide/show it
        const workoutForm = block.closest('form');
        if (workoutForm) {
          workoutForm.style.display = shouldShow ? 'block' : 'none';
        } else {
          // Fall back to just hiding the block if no parent form
          block.style.display = shouldShow ? 'block' : 'none';
        }
        
        if (shouldShow) {
          // Add highlighting to the visible block
          block.classList.add('highlight-filtered');
          visibleCount++;
        } else {
          block.classList.remove('highlight-filtered');
        }
      });
      
      // Show a message if no workouts match the filter
      const workoutsContainer = document.getElementById('workoutsContainer');
      let noMatchMessage = document.getElementById('noFilterMatchMessage');
      
      if (visibleCount === 0) {
        if (!noMatchMessage) {
          noMatchMessage = document.createElement('div');
          noMatchMessage.id = 'noFilterMatchMessage';
          noMatchMessage.className = 'alert alert-info';
          noMatchMessage.innerHTML = `
            <p>No workouts found for "${filterValue}" on this date.</p>
            <p>Would you like to see all matching workouts across all dates?</p>
            <button class="btn btn-primary me-2" id="showAllMatchingBtn">Show All Matching</button>
            <button class="btn btn-secondary" id="clearFilterBtn">Clear Filter</button>
          `;
          workoutsContainer.prepend(noMatchMessage);
          
          // Add event listeners
          document.getElementById('showAllMatchingBtn').addEventListener('click', () => {
            fetchAllFilteredWorkouts(currentFilter.type, currentFilter.value);
          });
          
          document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);
        }
      } else if (noMatchMessage) {
        noMatchMessage.remove();
      }
      
      console.log(`${visibleCount} blocks are now visible after filtering`);
    }
    
    // Fetch workouts from all dates matching the filter criteria
    function fetchAllFilteredWorkouts(filterType, filterValue) {
      // Show loading indicator
      const workoutsContainer = document.getElementById('workoutsContainer');
      workoutsContainer.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-3">Loading filtered workouts...</p></div>';
      
      // Build the filter URL
      const filterParams = new URLSearchParams();
      filterParams.append('type', filterType);
      filterParams.append('value', filterValue);
      
      // Fetch the filtered workouts from the server
      fetch(`/api/workouts/filter?${filterParams.toString()}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          displayFilteredWorkouts(data, filterValue);
        })
        .catch(error => {
          console.error('Error fetching filtered workouts:', error);
          
          // If the API doesn't exist yet, show a message
          workoutsContainer.innerHTML = `
            <div class="alert alert-info">
              <h5>Filtered View: ${filterValue}</h5>
              <p>This would show all workouts matching "${filterValue}" across all dates.</p>
              <p><strong>Server Implementation Required:</strong> To make this feature work, you need to create an API endpoint that returns all workouts matching the filter criteria.</p>
              <button class="btn btn-primary mt-3" id="clearFilterBtn">Clear Filter</button>
            </div>
          `;
          
          // Add event listener to the clear button
          document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);
        });
    }
    
    // Display workouts from all dates matching the filter criteria
    function displayFilteredWorkouts(data, filterValue) {
      const workoutsContainer = document.getElementById('workoutsContainer');
      
      // Clear the container
      workoutsContainer.innerHTML = '';
      
      // Create a header for the filtered view
      const header = document.createElement('div');
      header.className = 'mb-4';
      header.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <h4>Filtered by: ${filterValue}</h4>
          <button class="btn btn-outline-secondary" id="clearFilterBtn">Clear Filter</button>
        </div>
        <hr>
      `;
      workoutsContainer.appendChild(header);
      
      // Add event listener to clear filter button
      document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);
      
      // If no data or empty workouts array
      if (!data || !data.workoutsByDate || data.workoutsByDate.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'alert alert-info';
        noDataMessage.textContent = `No workouts found matching "${filterValue}".`;
        workoutsContainer.appendChild(noDataMessage);
        return;
      }
      
      // Display workouts grouped by date
      data.workoutsByDate
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort dates descending (newest first)
        .forEach(dateGroup => {
          const dateSection = document.createElement('div');
          dateSection.className = 'date-section mb-4';
          
          // Create date header with link to view all workouts for that date
          const dateHeader = document.createElement('div');
          dateHeader.className = 'date-header d-flex justify-content-between align-items-center mb-3';
          dateHeader.innerHTML = `
            <h5 class="mb-0">${formatDate(dateGroup.date)}</h5>
            <a href="/?date=${dateGroup.date}" class="btn btn-sm btn-outline-primary">View Full Day</a>
          `;
          dateSection.appendChild(dateHeader);
          
          // Add all workouts for this date
          dateGroup.allWorkouts.forEach(workout => {
            // Create a workout block for this workout
            const workoutBlock = document.createElement('div');
            workoutBlock.className = 'workout-entry mb-3';
            
            // Determine if this workout matches the current filter
            const isMatching = 
              (currentFilter.type === 'category' && workout.category === currentFilter.value) ||
              (currentFilter.type === 'movement' && workout.exercise === currentFilter.value) ||
              (currentFilter.type === 'muscle-focus' && workout.muscle_focus === currentFilter.value);
            
            // Add highlighting class if matching
            if (isMatching) {
              workoutBlock.classList.add('highlight-filtered');
            }
            
            // Create workout HTML
            workoutBlock.innerHTML = createWorkoutEntryHTML(workout, dateGroup.date);
            dateSection.appendChild(workoutBlock);
          });
          
          workoutsContainer.appendChild(dateSection);
        });
    }
    
    // Format date for display
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Create HTML for a complete workout entry
    function createWorkoutEntryHTML(workout, date) {
      // This matches the existing workout display but as HTML string
      let html = `
        <div class="movement-block mb-4"
             data-category="${workout.category}"
             data-movement="${workout.exercise}"
             data-muscle-focus="${workout.muscle_focus}">
  
          <h5>${workout.exercise} (${workout.muscle_focus})</h5>
          <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0 view-table">
              <thead class="table-light">
                <tr>
                  <th>Set</th>
                  <th>Reps</th>
                  <th>Weight (lbs)</th>
                  <th>Time (sec)</th>
                </tr>
              </thead>
              <tbody>`;
      
      // Add rows for each set
      workout.setRows.forEach(set => {
        html += `
          <tr class="set-row">
            <td class="set-cell text-center">Set ${set.setNumber}</td>
            <td><span class="view-cell">${set.reps || ''}</span></td>
            <td><span class="view-cell">${set.weight || ''}</span></td>
            <td><span class="view-cell">${set.duration || ''}</span></td>
          </tr>`;
      });
      
      // Add notes row if there are notes
      if (workout.notes) {
        html += `
          <tr>
            <td colspan="4">
              <span class="view-cell text-center"><strong>Notes:</strong> ${workout.notes}</span>
            </td>
          </tr>`;
      }
      
      html += `
              </tbody>
            </table>
          </div>
        </div>`;
      
      return html;
    }
    
    // Add a "Clear Filter" option to reset filters
    function addClearFilterOption() {
      const filterDropdown = document.getElementById('filterDropdown');
      
      // Check if clear filter option already exists
      if (!document.getElementById('clearFilterOption')) {
        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.id = 'clearFilterOption';
        
        const clearLink = document.createElement('a');
        clearLink.className = 'nav-link text-white';
        clearLink.href = '#';
        clearLink.textContent = 'Clear Filter';
        clearLink.addEventListener('click', clearFilter);
        
        navItem.appendChild(clearLink);
        
        // Insert clear filter option after the Filter dropdown
        const filterDropdownParent = filterDropdown.closest('.nav-item');
        filterDropdownParent.parentNode.insertBefore(navItem, filterDropdownParent.nextSibling);
      }
    }
    
    // Clear applied filters
    function clearFilter(event) {
      if (event) {
        event.preventDefault();
      }
      
      // Reset current filter state
      currentFilter = {
        type: null,
        value: null
      };
      
      // Reset the filter dropdown text
      const filterDropdown = document.getElementById('filterDropdown');
      filterDropdown.textContent = 'Filter';
      filterDropdown.classList.remove('active');
      
      // Remove any filter match message
      const noMatchMessage = document.getElementById('noFilterMatchMessage');
      if (noMatchMessage) {
        noMatchMessage.remove();
      }
      
      // Check if we're in the filtered view (all dates)
      const dateHeader = document.querySelector('.date-header');
      const isFilteredView = dateHeader && dateHeader.querySelector('.btn-outline-primary');
      
      if (isFilteredView) {
        // We're in the filtered view, reload the page to reset
        window.location.reload();
        return;
      }
      
      // Show all movement blocks on the current page
      const movementBlocks = document.querySelectorAll('.movement-block');
      movementBlocks.forEach(block => {
        const workoutForm = block.closest('form');
        if (workoutForm) {
          workoutForm.style.display = 'block';
        } else {
          block.style.display = 'block';
        }
        
        // Remove highlighting
        block.classList.remove('highlight-filtered');
      });
      
      // Remove the clear filter option
      const clearFilterOption = document.getElementById('clearFilterOption');
      if (clearFilterOption) {
        clearFilterOption.remove();
      }
    }
    
    // Initialize dropdown submenus
    function initDropdownSubmenus() {
      console.log('Initializing dropdown submenus');
      
      // Find all dropdown-toggle elements inside dropdown-submenu
      const dropdownToggles = document.querySelectorAll('.dropdown-submenu > .dropdown-item.dropdown-toggle');
      console.log(`Found ${dropdownToggles.length} dropdown toggles`);
      
      dropdownToggles.forEach(function(el) {
        el.addEventListener('click', function(e) {
          console.log('Dropdown toggle clicked');
          e.preventDefault();
          e.stopPropagation();
          
          // Toggle the 'show' class on the parent's sibling dropdown-menu
          const subMenu = this.nextElementSibling;
          
          if (!subMenu) {
            console.error('No submenu found for this toggle');
            return;
          }
          
          // First hide all other submenus
          document.querySelectorAll('.dropdown-submenu > .dropdown-menu').forEach(menu => {
            if (menu !== subMenu) {
              menu.classList.remove('show');
            }
          });
          
          // Then toggle this submenu
          subMenu.classList.toggle('show');
          
          // Position the submenu correctly
          if (subMenu.classList.contains('show')) {
            // For mobile view, position below
            if (window.innerWidth < 992) {
              subMenu.style.position = 'static';
            } else {
              // For desktop view, position to the side
              subMenu.style.position = 'absolute';
              subMenu.style.top = '0';
              subMenu.style.left = '100%';
            }
          }
        });
      });
      
      // Keep main dropdown open when clicking inside it
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', e => {
          // Only for dropdown items that aren't toggles
          if (e.target.classList.contains('dropdown-item') && 
              !e.target.classList.contains('dropdown-toggle')) {
            e.stopPropagation();
          }
        });
      });
      
      // Close submenus when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.dropdown-toggle')) {
          document.querySelectorAll('.dropdown-submenu > .dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
          });
        }
      });
    }
    
    // Listen for changes to workout data and update filter options
    function setupDataChangeListeners() {
      console.log('Setting up data change listeners');
      
      // Original local storage setItem
      const originalSetItem = localStorage.setItem;
      
      // Override localStorage.setItem to detect changes to workoutData
      localStorage.setItem = function(key, value) {
        // Call the original function first
        originalSetItem.apply(this, arguments);
        
        // If workoutData was changed, update filter dropdowns
        if (key === 'workoutData') {
          console.log('workoutData changed, updating filter dropdowns');
          populateFilterDropdowns();
        }
      };
      
      // Ensure modals update filter dropdowns after closing
      const modals = ['manageCategoryModal', 'manageMovementModal', 'manageMuscleFocusModal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.addEventListener('hidden.bs.modal', () => {
            console.log(`Modal ${modalId} closed, updating filter dropdowns`);
            populateFilterDropdowns();
          });
        }
      });
    }
    
// Populate category, movement, and muscle focus dropdowns in edit mode
function populateEditFormDropdowns() {
    console.log('Populating edit form dropdowns');
    
    // Get workout data from localStorage
    const data = getData();
    if (!data) return;
    
    // Get all forms in edit mode
    document.querySelectorAll('.movement-block').forEach(block => {
      const categorySelect = block.querySelector('select[name="category"]');
      const exerciseSelect = block.querySelector('select[name="exercise"]');
      const muscleFocusSelect = block.querySelector('select[name="muscle_focus"]');
      
      if (!categorySelect || !exerciseSelect || !muscleFocusSelect) {
        console.log('Missing select elements in a block');
        return;
      }
      
      const currentCategory = block.getAttribute('data-category');
      const currentMovement = block.getAttribute('data-movement');
      const currentMuscleFocus = block.getAttribute('data-muscle-focus');
      
      console.log('Current values:', { currentCategory, currentMovement, currentMuscleFocus });
      
      // Populate category dropdown
      categorySelect.innerHTML = '<option value="" disabled>Select Category</option>';
      Object.keys(data).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === currentCategory) {
          option.selected = true;
        }
        categorySelect.appendChild(option);
      });
      
      // Enable the select elements
      categorySelect.disabled = false;
      
      // Populate movement dropdown based on current category
      if (currentCategory && data[currentCategory]) {
        exerciseSelect.innerHTML = '<option value="" disabled>Select Movement</option>';
        Object.keys(data[currentCategory].movements || {}).forEach(movement => {
          const option = document.createElement('option');
          option.value = movement;
          option.textContent = movement;
          if (movement === currentMovement) {
            option.selected = true;
          }
          exerciseSelect.appendChild(option);
        });
        
        // Enable movements dropdown
        exerciseSelect.disabled = false;
      }
      
      // Populate muscle focus dropdown based on current category and movement
      if (currentCategory && currentMovement && 
          data[currentCategory] && 
          data[currentCategory].movements && 
          data[currentCategory].movements[currentMovement]) {
        
        muscleFocusSelect.innerHTML = '<option value="" disabled>Select Muscle Focus</option>';
        const muscleFocusOptions = data[currentCategory].movements[currentMovement];
        
        if (Array.isArray(muscleFocusOptions)) {
          muscleFocusOptions.forEach(focus => {
            const option = document.createElement('option');
            option.value = focus;
            option.textContent = focus;
            if (focus === currentMuscleFocus) {
              option.selected = true;
            }
            muscleFocusSelect.appendChild(option);
          });
        }
        
        // Enable muscle focus dropdown
        muscleFocusSelect.disabled = false;
      }
      
      // Add change handler for category to update movement options
      categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        console.log('Category changed to:', selectedCategory);
        
        // Update movement dropdown
        exerciseSelect.innerHTML = '<option value="" disabled>Select Movement</option>';
        
        if (selectedCategory && data[selectedCategory] && data[selectedCategory].movements) {
          Object.keys(data[selectedCategory].movements).forEach(movement => {
            const option = document.createElement('option');
            option.value = movement;
            option.textContent = movement;
            exerciseSelect.appendChild(option);
          });
          
          // Select first option and enable dropdown
          if (exerciseSelect.options.length > 1) {
            exerciseSelect.options[1].selected = true;
            
            // Trigger change event to update muscle focus dropdown
            const changeEvent = new Event('change');
            exerciseSelect.dispatchEvent(changeEvent);
          }
          
          exerciseSelect.disabled = false;
        } else {
          exerciseSelect.disabled = true;
        }
        
        // Reset muscle focus dropdown
        muscleFocusSelect.innerHTML = '<option value="" disabled selected>Select Muscle Focus</option>';
        muscleFocusSelect.disabled = true;
      });
      
      // Add change handler for movement to update muscle focus options
      exerciseSelect.addEventListener('change', function() {
        const selectedCategory = categorySelect.value;
        const selectedMovement = this.value;
        console.log('Movement changed to:', selectedMovement);
        
        // Update muscle focus dropdown
        muscleFocusSelect.innerHTML = '<option value="" disabled>Select Muscle Focus</option>';
        
        if (selectedCategory && selectedMovement && 
            data[selectedCategory] && 
            data[selectedCategory].movements && 
            data[selectedCategory].movements[selectedMovement]) {
          
          const muscleFocusOptions = data[selectedCategory].movements[selectedMovement];
          
          if (Array.isArray(muscleFocusOptions)) {
            muscleFocusOptions.forEach(focus => {
              const option = document.createElement('option');
              option.value = focus;
              option.textContent = focus;
              muscleFocusSelect.appendChild(option);
            });
            
            // Select first option if available
            if (muscleFocusSelect.options.length > 1) {
              muscleFocusSelect.options[1].selected = true;
            }
            
            muscleFocusSelect.disabled = false;
          }
        } else {
          muscleFocusSelect.disabled = true;
        }
      });
    });
    
    console.log('Edit form dropdowns populated');
  }
  
  // Make this function available globally
  window.populateEditFormDropdowns = populateEditFormDropdowns;
    
    // Override toggleEditMode to call populateEditFormDropdowns
    window.originalToggleEditMode = window.toggleEditMode;
    window.toggleEditMode = function() {
      const wasInEditMode = editMode;
      
      if (typeof window.originalToggleEditMode === 'function') {
        window.originalToggleEditMode();
      } else {
        // Fallback if the original function doesn't exist
        editMode = !editMode;
        if (editMode) {
          // Edit mode logic...
          document.querySelectorAll('.movement-block').forEach(block => {
            block.querySelectorAll('.view-cell').forEach(c => c.style.display = 'none');
            block.querySelectorAll('.edit-cell').forEach(c => c.style.display = 'table-cell');
            block.querySelectorAll('.edit-buttons').forEach(b => b.style.display = 'block');
          });
          workoutsContainer.classList.add('edit-mode');
          document.getElementById('toggleEditBtn').textContent = 'Exit Edit';
        } else {
          // Exit edit mode logic...
          document.querySelectorAll('.movement-block').forEach(block => {
            block.querySelectorAll('.view-cell').forEach(c => c.style.display = 'table-cell');
            block.querySelectorAll('.edit-cell').forEach(c => c.style.display = 'none');
            block.querySelectorAll('.edit-buttons').forEach(b => b.style.display = 'none');
          });
          workoutsContainer.classList.remove('edit-mode');
          document.getElementById('toggleEditBtn').textContent = 'Edit';
        }
      }
      
      // If entering edit mode, populate dropdowns
      if (!wasInEditMode && editMode) {
        setTimeout(populateEditFormDropdowns, 0);
      }
    };
    
    // Make getData available to the global scope
    if (typeof window.getData !== 'function') {
      window.getData = getData;
    }
    
    console.log('Enhanced filter logic initialized, populating dropdowns...');
    
    // Initialize filter functionality
    populateFilterDropdowns();
    initDropdownSubmenus();
    setupDataChangeListeners();
  });// Enhanced filter functionality for user experience
