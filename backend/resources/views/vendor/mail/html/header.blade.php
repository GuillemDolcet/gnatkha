@props(['url'])
<tr>
<td class="header">
<a href="{{ config('app.frontend_url') }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="{{ config('app.frontend_url') . '/images/logo.png' }}" class="logo" alt="{{ config('app.name') }}">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
