import { LocalAnchor } from '../shared/navigation';
import { Component, ChangeDetectionStrategy, inject, DestroyRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpApi, DialogFocus, defer } from '../shared/http-api';
import { Display } from '../shared/display';
import {
  Event,
  Category,
  Organisation,
  Registration,
  Receipt,
  Forecast,
  EventDraft,
} from '../shared/models';
import { Weather } from '../shared/weather';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-page',
  standalone: true,
  imports: [LocalAnchor, CommonModule, FormsModule],
  templateUrl: './categories.html',
})
export class CategoriesComponent {
  readonly vm = this;
  readonly nav = { open: false };
  readonly view = inject(Display);
  readonly destroyRef = inject(DestroyRef);
  loading = false;
  error = '';
  saving = false;
  message = '';
  fields: Record<string, string> = {};
  data: Partial<Category> = { name: '', slug: '' };
  categories: Category[] = [];
  selected!: Category;
  deleteError = '';
  deleting = false;
  load!: () => void;
  edit!: (category: Category) => void;
  reset!: (form?: NgForm) => void;
  save!: (form: NgForm) => void;
  requestDelete!: (category: Category) => void;
  cancelDelete!: () => void;
  remove!: () => void;
  constructor() {
    const api = inject(HttpApi);

    const vm = this;
    vm.data = { name: '', slug: '' };
    vm.fields = {};
    vm.load = function () {
      vm.loading = true;
      return api
        .get<Category[]>('api/categories')
        .then(
          (categories) => {
            vm.categories = categories;
          },
          (error) => {
            vm.error = error.message;
          },
        )
        .finally(() => {
          vm.loading = false;
        });
    };
    vm.edit = function (category) {
      vm.data = structuredClone(category);
      vm.fields = {};
      vm.error = '';
      vm.message = '';
    };
    vm.reset = function (form) {
      vm.data = { name: '', slug: '' };
      vm.fields = {};
      form?.form.markAsPristine();
      form?.form.markAsUntouched();
    };
    vm.save = function (form) {
      vm.error = '';
      vm.message = '';
      vm.fields = {};
      if (form.invalid) {
        vm.error = 'Enter a name and a lowercase slug.';
        return;
      }
      vm.saving = true;
      const saving = vm.data.id
        ? api.put<Category>('api/admin/categories/' + vm.data.id, vm.data)
        : api.post<Category>('api/admin/categories', vm.data);
      saving
        .then(
          (category) => {
            vm.message = 'Saved ' + category.name + '.';
            vm.reset(form);
            vm.load();
          },
          (error) => {
            vm.error = error.message;
            vm.fields = error.fields || {};
          },
        )
        .finally(() => {
          vm.saving = false;
        });
    };
    vm.requestDelete = function (category) {
      vm.selected = category;
      vm.deleteError = '';
      document.querySelector<HTMLDialogElement>('#delete-category-dialog')!.showModal();
    };
    vm.cancelDelete = function () {
      document.querySelector<HTMLDialogElement>('#delete-category-dialog')!.close();
    };
    vm.remove = function () {
      vm.deleting = true;
      api
        .remove('api/admin/categories/' + vm.selected.id)
        .then(
          () => {
            vm.message = 'Deleted ' + vm.selected.name + '.';
            vm.cancelDelete();
            vm.load();
          },
          (error) => {
            vm.deleteError = error.message;
          },
        )
        .finally(() => {
          vm.deleting = false;
        });
    };
    vm.load();
  }
}
